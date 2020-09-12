/**
 * can't get module augmentation to work
 * @type {any}
 */
const expect = require("expect");
const fs = require("fs/promises");
const path = require("path");
const playwright = require("playwright");
const { extractSpeechLines } = require("./logParser");

/**
 * @param {number} timeoutMS
 * @returns {Promise<void>}
 */
function sleep(timeoutMS) {
	return new Promise((resolve) => setTimeout(() => resolve(), timeoutMS));
}

/**
 * @param {object} config
 * @param {import('playwright').Browser} config.browser
 * @param {string} config.logFilePath
 */
async function run(config) {
	const { browser, logFilePath } = config;
	const context = await browser.newContext();
	const page = await context.newPage();

	function awaitNvdaRecording() {
		return sleep(2000);
	}

	// Intuitively we keep an open handle and read new logs every time we call `readAllNewLogs`.
	// However, once node read streams have reached the current! end calling read() again won't read anything that was newly written.
	// We have to refresh the file.
	// It's a bit heave on memory since we read the whole file into memory.
	// Should be fine for most tests.
	let logFileOffset = 0;
	async function readAllNewLogs() {
		const fullContent = await fs.readFile(logFilePath, { encoding: "utf-8" });
		const newContent = fullContent.slice(logFileOffset);
		logFileOffset = fullContent.length;
		return newContent;
	}

	expect.extend({
		/**
		 * @param {() => Promise<void>} fn
		 * @param {string[]} expectedLines
		 */
		async toCreateSpeech(fn, expectedLines) {
			// move to end
			await readAllNewLogs();
			await fn();
			await awaitNvdaRecording();
			const nvdaLog = await readAllNewLogs();

			const actualLines = extractSpeechLines(nvdaLog);
			expect(actualLines).toEqual(expectedLines);

			return { pass: true };
		},
	});

	await page.goto("https://material-ui.com/");
	// Without bringing it to front the adress bar will still be focused.
	// NVDA wouldn't record any page actions
	await page.bringToFront();
	await awaitNvdaRecording();

	await expect(async () => {
		await page.keyboard.press("s");
	}).toCreateSpeech([
		["banner landmark"],
		["Search", "combo box", "expanded", "has auto complete", "editable"],
		["Search…"],
	]);

	await expect(async () => {
		await page.keyboard.type("Rating");
	}).toCreateSpeech([]);

	await expect(async () => {
		await page.keyboard.press("ArrowDown");
	}).toCreateSpeech([["Rating", "1 of 5"]]);
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
		// await sleep(10000);
	} finally {
		tearDown();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(error.code || 1);
});
