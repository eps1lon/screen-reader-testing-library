const { default: diff } = require("jest-diff");
const { toMatchInlineSnapshot, toMatchSnapshot } = require("jest-snapshot");
const { createSpeechRecorder } = require("./index");

const speechSnapshotBrand = Symbol.for(
	"screen-reader-testing-library.speechSnapshot"
);

/**
 * Must return `any` or `expect.extend(createMatchers(logFilePath))` does not typecheck.
 * `toMatchInlineSnapshot` will be unassignable for unknown reasons.
 * @param {string} logFilePath
 * @returns {any}
 */
function createMatchers(logFilePath) {
	const speechRecorder = createSpeechRecorder(logFilePath);

	/**
	 * @param {import('./index').Speech} recordedSpeech
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
	 * @param {import('./index').Speech} expectedSpeech
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
// This module is only a convenience helper augmenting jest types.
// TypeScript users should import from this

/**
 * @param {jest.Expect} expect
 * @param {string} logFilePath
 * @returns {void}
 */
export default function extendExpect(expect, logFilePath) {
	expect.extend(createMatchers(logFilePath));

	expect.addSnapshotSerializer({
		/**
		 * @param {any} val
		 */
		print(val) {
			/**
			 * @type {{ speech: import('./index').Speech }}
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
