export type SpeechLine = string[];
export type Speech = string[][];
export type Recorder = {
	start: () => Promise<void>;
	/**
	 * Returns the speech output since the last `start()`.
	 */
	stop: () => Promise<string[][]>;
	/**
	 * Returns the speech output during the call to `fn`.
	 */
	record: (fn: () => Promise<void>) => Promise<string[][]>;
	readable: () => Promise<boolean>;
};
/**
 * Must be called before the very first call to `start`.
 *
 * @remarks It seems like it debounces the speech so that the user isn't flooded when quickly navigating.
 */
export function awaitNvdaRecording(): Promise<void>;
/**
 * @param {string} logFilePath
 * @returns {Recorder}
 */
export function createSpeechRecorder(logFilePath: string): Recorder;
/**
 * @param {string} logFilePath
 */
export function createJestSpeechRecorder(logFilePath: string): Recorder;
