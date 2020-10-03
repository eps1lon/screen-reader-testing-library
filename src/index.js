const { promises: fs } = require("fs");
const { default: diff } = require("jest-diff");
const { toMatchInlineSnapshot, toMatchSnapshot } = require("jest-snapshot");
const { extractSpeechLines } = require("./logParser");

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
	async function recordLines(fn) {
		// move to end
		await start();
		await fn();
		return await stop();
	}

	function readable() {
		return fs.access(logFilePath);
	}

	return { readable, recordLines, start, stop };
}

/**
 * @param {string} logFilePath
 */
function createMatchers(logFilePath) {
	const recorder = createSpeechRecorder(logFilePath);

	/**
	 *
	 * @param {() => Promise<void>} fn
	 * @param {string[][]} _expectedLines
	 * @returns {Promise<ReturnType<typeof toMatchInlineSnapshot>>}
	 * @this {import('jest-snapshot/build/types').Context}
	 */
	async function toMatchSpeechInlineSnapshot(fn, _expectedLines) {
		// throws with "Jest: Multiple inline snapshots for the same call are not supported."
		throw new Error("Not implemented");
		// // move to end
		// await recorder.start();
		// await fn();
		// const actualLines = await recorder.stop();

		// return toMatchInlineSnapshot.call(this, actualLines);
	}

	/**
	 *
	 * @param {() => Promise<void>} fn
	 * @param {string} [snapshotName]
	 * @returns {Promise<ReturnType<typeof toMatchSnapshot>>}
	 * @this {import('jest-snapshot/build/types').Context}
	 */
	async function toMatchSpeechSnapshot(fn, snapshotName) {
		const actualLines = await recorder.recordLines(fn);

		return toMatchSnapshot.call(this, actualLines, snapshotName);
	}

	/**
	 * @param {() => Promise<void>} fn
	 * @param {string[][]} expectedLines
	 * @returns {Promise<{actual: unknown, message: () => string, pass: boolean}>}
	 * @this {import('jest-snapshot/build/types').Context}
	 */
	async function toAnnounceNVDA(fn, expectedLines) {
		const actualLines = await recorder.recordLines(fn);

		const options = {
			comment: "deep equality",
			isNot: this.isNot,
			promise: this.promise,
		};

		const pass = this.equals(actualLines, expectedLines);
		const message = pass
			? () =>
					this.utils.matcherHint("toBe", undefined, undefined, options) +
					"\n\n" +
					`Expected: not ${this.utils.printExpected(expectedLines)}\n` +
					`Received: ${this.utils.printReceived(actualLines)}`
			: () => {
					const diffString = diff(expectedLines, actualLines, {
						expand: this.expand,
					});
					return (
						this.utils.matcherHint("toBe", undefined, undefined, options) +
						"\n\n" +
						(diffString && diffString.includes("- Expect")
							? `Difference:\n\n${diffString}`
							: `Expected: ${this.utils.printExpected(expectedLines)}\n` +
							  `Received: ${this.utils.printReceived(actualLines)}`)
					);
			  };

		return { actual: actualLines, message, pass };
	}

	return { toAnnounceNVDA, toMatchSpeechInlineSnapshot, toMatchSpeechSnapshot };
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

module.exports = {
	awaitNvdaRecording,
	createSpeechRecorder,
	createMatchers,
	createJestSpeechRecorder,
};
