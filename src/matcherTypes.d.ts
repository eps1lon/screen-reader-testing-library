import { Speech } from "screen-reader-testing-library";

export {};

declare global {
	namespace jest {
		interface Matchers<R> {
			toAnnounceNVDA(expectedLines: Speech): Promise<void>;
			toMatchSpeechSnapshot(snapshotName?: string): Promise<void>;
			toMatchSpeechInlineSnapshot(
				expectedLinesSnapshot?: string
			): Promise<void>;
		}
	}
}
