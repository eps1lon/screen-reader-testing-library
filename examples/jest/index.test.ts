import * as playwright from "playwright";
import {
	awaitNvdaRecording,
	createMatchers,
	createJestSpeechRecorder,
} from "screen-reader-testing-library";

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
	const speechRecorder = createJestSpeechRecorder(logFilePath!);

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
	});

	afterAll(async () => {
		await browser.close();
	});

	beforeEach(async () => {
		page = await browser.newPage();
	});

	afterEach(async () => {
		await page.close();
	});

	it("matches the NVDA speech inline snapshot when searching the docs", async () => {
		// Opening a new page with the same URL would trigger NVDA's focus caching.
		// https://stackoverflow.com/questions/22517242/how-to-prevent-nvda-setting-focus-automatically-on-last-used-html-element
		// We keep tests isolated by adding a random string to the URL that does not affect the page.
		await page.goto(
			"https://5f6a0f0de73ecc00085cbbe4--material-ui.netlify.app/?nvda-test-3"
		);
		// Without bringing it to front the adress bar will still be focused.
		// NVDA wouldn't record any page actions
		await page.bringToFront();
		await awaitNvdaRecording();

		expect(
			await speechRecorder.recordLines(async () => {
				await page.keyboard.press("s");
			})
		).toMatchInlineSnapshot(`
		Array [
		  Array [
		    "banner landmark",
		  ],
		  Array [
		    "Search",
		    "combo box",
		    "expanded",
		    "has auto complete",
		    "editable",
		    "Search…",
		  ],
		]
	`);

		expect(
			await speechRecorder.recordLines(async () => {
				await page.keyboard.type("Rating");
			})
		).toMatchInlineSnapshot(`Array []`);

		expect(
			await speechRecorder.recordLines(async () => {
				await page.keyboard.press("ArrowDown");
			})
		).toMatchInlineSnapshot(`
		Array [
		  Array [
		    "list",
		  ],
		  Array [
		    "Link to the result",
		    "1 of 5",
		  ],
		]
	`);
	}, 20000);

	it("matches the NVDA speech snapshot when searching the docs", async () => {
		// Opening a new page with the same URL would trigger NVDA's focus caching.
		// https://stackoverflow.com/questions/22517242/how-to-prevent-nvda-setting-focus-automatically-on-last-used-html-element
		// We keep tests isolated by adding a random string to the URL that does not affect the page.
		await page.goto(
			"https://5f6a0f0de73ecc00085cbbe4--material-ui.netlify.app/?nvda-test-2"
		);
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

	// Example for manually authored expectations
	it("produces the expected NVDA speech output when searching the docs", async () => {
		await page.goto(
			"https://5f6a0f0de73ecc00085cbbe4--material-ui.netlify.app/"
		);
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
});
