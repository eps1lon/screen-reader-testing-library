export {};
export { extendExpect as default } from "./index";

declare global {
	namespace jest {
		interface Matchers<R> {
			toAnnounceNVDA(expectedLines: string[][]): Promise<void>;
			toMatchSpeechSnapshot(snapshotName?: string): Promise<void>;
			toMatchSpeechInlineSnapshot(expectedLinesSnapshot?: string): void;
		}
	}
}
