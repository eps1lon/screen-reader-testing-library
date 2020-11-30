const { create } = require("domain");
const { promises: fs } = require("fs");
const { default: diff } = require("jest-diff");
const { toMatchInlineSnapshot, toMatchSnapshot } = require("jest-snapshot");
const { extractSpeechLines } = require("./logParser");

const speechSnapshotBrand = Symbol.for(
	"screen-reader-testing-library.speechSnapshot"
);

/**
 * @param {number} timeoutMS
 * @returns {Promise<void>}
 */
function sleep(timeoutMS) {
	return new Promise((resolve) => setTimeout(() => resolve(), timeoutMS));
}

// need to wait for NVDA to flush the speech
// It seems like it debounces the speech so that the user isn't flooded when quickly navigating
function awaitNvdaRecording() {
	return sleep(2000);
}

/**
 * @param {string} logFilePath
 */
function createSpeechRecorder(logFilePath) {
	// Intuitively we keep an open handle and read new logs every time we call `readAllNewLogs`.
	// However, once node read streams have reached the current! end calling read() again won't read anything that was newly written.
	// We have to refresh the file.
	// It's a bit heave on memory since we read the whole file into memory.
	// Should be fine for most tests.
	let logFileOffset = 0;
	async function stop() {
		await awaitNvdaRecording();

		const fullContent = await fs.readFile(logFilePath, { encoding: "utf-8" });
		const newContent = fullContent.slice(logFileOffset);
		logFileOffset = fullContent.length;

		return extractSpeechLines(newContent);
	}

	async function start() {
		const logFile = await fs.stat(logFilePath);
		logFileOffset = logFile.size;
	}

	/**
	 * @param {() => Promise<void>} fn
	 * @returns {Promise<string[][]>}
	 */
	async function record(fn) {
		// move to end
		await start();
		await fn();
		return await stop();
	}

	function readable() {
		return fs.access(logFilePath);
	}

	return { readable, record, start, stop };
}

/**
 * Must return `any` or `expect.extend(createMatchers(logFilePath))` does not typecheck.
 * `toMatchInlineSnapshot` will be unassignable for unknown reasons.
 * @param {string} logFilePath
 * @returns {any}
 */
function createMatchers(logFilePath) {
	const speechRecorder = createSpeechRecorder(logFilePath);

	/**
	 *
	 * @param {string[][]} recordedSpeech
	 * @param {string} [expectedSpeechSnapshot]
	 * @returns {ReturnType<typeof toMatchInlineSnapshot>}
	 * @this {import('jest-snapshot/build/types').Context}
	 */
	function toMatchSpeechInlineSnapshot(recordedSpeech, expectedSpeechSnapshot) {
		// Abort test on first mismatch.
		// Subsequent actions will be based on an incorrect state otherwise and almost always fail as well.
		this.dontThrow = () => {};
		if (typeof recordedSpeech === "function") {
			throw new Error(
				"Recording lines is not implemented by the matcher. Use `expect(recordLines(async () => {})).resolves.toMatchInlineSnapshot()` instead"
			);
		}

		const actualSpeechSnapshot = {
			[speechSnapshotBrand]: true,
			speech: recordedSpeech,
		};

		// jest's `toMatchInlineSnapshot` relies on arity.
		if (expectedSpeechSnapshot === undefined) {
			return toMatchInlineSnapshot.call(this, actualSpeechSnapshot);
		}
		return toMatchInlineSnapshot.call(
			this,
			actualSpeechSnapshot,
			expectedSpeechSnapshot
		);
	}

	/**
	 *
	 * @param {() => Promise<void>} fn
	 * @param {string} [snapshotName]
	 * @returns {Promise<ReturnType<typeof toMatchSnapshot>>}
	 * @this {import('jest-snapshot/build/types').Context}
	 */
	async function toMatchSpeechSnapshot(fn, snapshotName) {
		const speech = await speechRecorder.record(fn);

		return toMatchSnapshot.call(this, speech, snapshotName);
	}

	/**
	 * @param {() => Promise<void>} fn
	 * @param {string[][]} expectedSpeech
	 * @returns {Promise<{actual: unknown, message: () => string, pass: boolean}>}
	 * @this {import('jest-snapshot/build/types').Context}
	 */
	async function toAnnounceNVDA(fn, expectedSpeech) {
		const actualSpeech = await speechRecorder.record(fn);

		const options = {
			comment: "deep equality",
			isNot: this.isNot,
			promise: this.promise,
		};

		const pass = this.equals(actualSpeech, expectedSpeech);
		const message = pass
			? () =>
					this.utils.matcherHint("toBe", undefined, undefined, options) +
					"\n\n" +
					`Expected: not ${this.utils.printExpected(expectedSpeech)}\n` +
					`Received: ${this.utils.printReceived(actualSpeech)}`
			: () => {
					const diffString = diff(expectedSpeech, actualSpeech, {
						expand: this.expand,
					});
					return (
						this.utils.matcherHint("toBe", undefined, undefined, options) +
						"\n\n" +
						(diffString && diffString.includes("- Expect")
							? `Difference:\n\n${diffString}`
							: `Expected: ${this.utils.printExpected(expectedSpeech)}\n` +
							  `Received: ${this.utils.printReceived(actualSpeech)}`)
					);
			  };

		return { actual: actualSpeech, message, pass };
	}

	return { toAnnounceNVDA, toMatchSpeechSnapshot, toMatchSpeechInlineSnapshot };
}

/**
 * @param {string} logFilePath
 */
function createJestSpeechRecorder(logFilePath) {
	const recorder = createSpeechRecorder(logFilePath);

	beforeAll(async () => {
		try {
			await recorder.readable();
		} catch (error) {
			throw new Error(`Log file in '${logFilePath}' is not readable`);
		}
	});

	return recorder;
}

/**
 *
 * @param {jest.Expect} expect
 * @param {*} logFilePath
 */
function extendExpect(expect, logFilePath) {
	expect.extend(createMatchers(logFilePath));

	expect.addSnapshotSerializer({
		/**
		 * @param {any} val
		 */
		print(val) {
			/**
			 * @type {{ speech: string[][] }}
			 */
			const snapshot = val;
			const { speech } = snapshot;

			return speech
				.map((line) => {
					return `"${line.join(", ")}"`;
				})
				.join("\n");
		},
		test(value) {
			return value != null && value[speechSnapshotBrand] === true;
		},
	});
}

module.exports = {
	awaitNvdaRecording,
	createSpeechRecorder,
	createJestSpeechRecorder,
	extendExpect,
};
