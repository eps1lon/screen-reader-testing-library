/**
 * can't get module augmentation to work
 * @type {any}
 */
const expect = require("expect");
const path = require("path");
const playwright = require("playwright");
const {
	awaitNvdaRecording,
	createSpeechRecorder,
} = require("screen-reader-testing-library");

/**
 * @param {object} config
 * @param {import('playwright').Browser} config.browser
 * @param {string} config.logFilePath
 */
async function run(config) {
	const { browser, logFilePath } = config;
	const context = await browser.newContext();
	const page = await context.newPage();

	const recorder = createSpeechRecorder(logFilePath);

	expect.extend({
		/**
		 * @param {() => Promise<void>} fn
		 * @param {string[]} expectedLines
		 */
		async toCreateSpeech(fn, expectedLines) {
			// move to end
			await recorder.start();
			await fn();
			const actualLines = await recorder.stop();

			expect(actualLines).toEqual(expectedLines);

			return { pass: true };
		},
	});

	await page.goto("https://5f6a0f0de73ecc00085cbbe4--material-ui.netlify.app/");
	// Without bringing it to front the adress bar will still be focused.
	// NVDA wouldn't record any page actions
	await page.bringToFront();
	await awaitNvdaRecording();

	await expect(async () => {
		await page.keyboard.press("s");
	}).toCreateSpeech([
		["banner landmark"],
		[
			"Search",
			"combo box",
			"expanded",
			"has auto complete",
			"editable",
			"Search…",
			"blank",
		],
	]);

	await expect(async () => {
		await page.keyboard.type("Rating");
	}).toCreateSpeech([]);

	await expect(async () => {
		await page.keyboard.press("ArrowDown");
	}).toCreateSpeech([["list"], ["Link to the result", "1 of 5"]]);
}

/**
 * @param {object} config
 * @param {"chromium" | "firefox" | "webkit"} config.browserType
 */
async function setup(config) {
	const { browserType } = config;

	const [browser] = await Promise.all([
		playwright[browserType].launch({ headless: false }),
	]);

	async function tearDown() {
		console.log("teardown");
		return Promise.allSettled([browser.close()]);
	}

	return { browser: browser, tearDown };
}

async function main() {
	const browserType = "chromium";
	const [logFilePath] = process.argv.slice(2);

	if (typeof logFilePath !== "string") {
		throw new TypeError("No path to logfile given!");
	}
	if (!path.isAbsolute(logFilePath)) {
		throw new TypeError("The path to the logfile must be absolute!");
	}

	const { browser, tearDown } = await setup({
		browserType,
	});

	try {
		await run({ browser, logFilePath });
	} finally {
		tearDown();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(error.code || 1);
});
