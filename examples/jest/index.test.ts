import * as playwright from "playwright";
import { awaitNvdaRecording, createMatchers } from "../../src";

const logFilePath = process.env.LOG_FILE_PATH;

declare global {
	namespace jest {
		interface Matchers<R> {
			toAnnounceNVDA(expectedLines: string[][]): Promise<void>;
			toMatchSpeechSnapshot(snapshotName?: string): Promise<void>;
			// throws with "Jest: Multiple inline snapshots for the same call are not supported."
			// toMatchSpeechInlineSnapshot(expectedLines: string[][]): R;
		}
	}
}

describe("chromium", () => {
	let browser: playwright.Browser;
	let page: playwright.Page;
	beforeAll(async () => {
		if (logFilePath === undefined) {
			throw new TypeError(
				"Log filepath not specified. Set the path in an environment variable named `LOG_FILE_PATH`."
			);
		}

		expect.extend({ ...(await createMatchers(logFilePath)) });
		browser = await playwright.chromium.launch({ headless: false });
		page = await browser.newPage();
	});

	afterAll(async () => {
		await browser.close();
	});

	beforeEach(async () => {
		page = await browser.newPage();
	});

	afterEach(async () => {
		// Closing the page results in different behavior for subsequent tests.
		// For some reason NVDA is focusing the language change dropdown when reloading the page.
		// Not closing pages and opening new ones works though.
		// await page.close();
	});

	it("produces the expected NVDA speech output when searching the docs", async () => {
		await page.goto("https://material-ui.com/");
		// Without bringing it to front the adress bar will still be focused.
		// NVDA wouldn't record any page actions
		await page.bringToFront();
		await awaitNvdaRecording();

		await expect(async () => {
			await page.keyboard.press("s");
		}).toAnnounceNVDA([
			["banner landmark"],
			[
				"Search",
				"combo box",
				"expanded",
				"has auto complete",
				"editable",
				"Search…",
			],
		]);

		await expect(async () => {
			await page.keyboard.type("Rating");
		}).toAnnounceNVDA([]);

		await expect(async () => {
			await page.keyboard.press("ArrowDown");
		}).toAnnounceNVDA([["list"], ["Link to the result", "1 of 5"]]);
	}, 20000);

	it("matches the NVDA speech snapshot when searching the docs", async () => {
		await page.goto("https://material-ui.com/");
		// Without bringing it to front the adress bar will still be focused.
		// NVDA wouldn't record any page actions
		await page.bringToFront();
		await awaitNvdaRecording();

		await expect(async () => {
			await page.keyboard.press("s");
		}).toMatchSpeechSnapshot("Focused searchbox");

		await expect(async () => {
			await page.keyboard.type("Rating");
		}).toMatchSpeechSnapshot("entered searchterm");

		await expect(async () => {
			await page.keyboard.press("ArrowDown");
		}).toMatchSpeechSnapshot("navigated to first result");
	}, 20000);
});
