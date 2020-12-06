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
/**
 * @param {jest.Expect} expect
 * @param {string} logFilePath
 * @returns {void}
 */
export function extendExpect(expect: jest.Expect, logFilePath: string): void;
