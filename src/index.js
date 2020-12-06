const { promises: fs } = require("fs");
const { extractSpeechLines } = require("./logParser");

/**
 * @typedef {string[]} SpeechLine
 * @typedef {SpeechLine[]} Speech
 *
 * @typedef {object} Recorder
 * @property {() => Promise<void>} start
 * @property {() => Promise<Speech>} stop Returns the speech output since the last `start()`.
 * @property {(fn: () => Promise<void>) => Promise<Speech>} record Returns the speech output during the call to `fn`.
 * @property {() => Promise<boolean>} readable
 */

/**
 * @param {number} timeoutMS
 * @returns {Promise<void>}
 */
function sleep(timeoutMS) {
	return new Promise((resolve) => setTimeout(() => resolve(), timeoutMS));
}

/**
 * Must be called before the very first call to `start`.
 *
 * @remarks It seems like it debounces the speech so that the user isn't flooded when quickly navigating.
 */
function awaitNvdaRecording() {
	return sleep(2000);
}

/**
 * @param {string} logFilePath
 * @returns {Recorder}
 */
function createSpeechRecorder(logFilePath) {
	// Intuitively we keep an open handle and read new logs every time we call `readAllNewLogs`.
	// However, once node read streams have reached the current! end calling read() again won't read anything that was newly written.
	// We have to refresh the file.
	// It's a bit heave on memory since we read the whole file into memory.
	// Should be fine for most tests.
	let logFileOffset = 0;

	/**
	 * @returns {Promise<Speech>}
	 */
	async function stop() {
		await awaitNvdaRecording();

		const fullContent = await fs.readFile(logFilePath, { encoding: "utf-8" });
		const newContent = fullContent.slice(logFileOffset);
		logFileOffset = fullContent.length;

		return extractSpeechLines(newContent);
	}

	/**
	 * @returns {Promise<void>}
	 */
	async function start() {
		const logFile = await fs.stat(logFilePath);
		logFileOffset = logFile.size;
	}

	/**
	 * @param {() => Promise<void>} fn
	 * @returns {Promise<Speech>}
	 */
	async function record(fn) {
		// move to end
		await start();
		await fn();
		return await stop();
	}

	/**
	 * @returns {Promise<boolean>}
	 */
	function readable() {
		return fs.access(logFilePath).then(
			() => true,
			() => false
		);
	}

	return { readable, record, start, stop };
}

/**
 * @param {string} logFilePath
 */
function createJestSpeechRecorder(logFilePath) {
	const recorder = createSpeechRecorder(logFilePath);

	beforeAll(async () => {
		if (!(await recorder.readable())) {
			throw new Error(`Log file in '${logFilePath}' is not readable`);
		}
	});

	return recorder;
}

module.exports = {
	awaitNvdaRecording,
	createSpeechRecorder,
	createJestSpeechRecorder,
};
