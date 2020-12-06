const { promises: fs } = require("fs");
const os = require("os");
const path = require("path");
const { extendExpect } = require("../index");

/**
 * @type {string}
 */
let logFilePath;
/**
 * @param {string[][]} speech
 */
function speakMock(speech) {
	// Check existing fixtures for how to mock speech output.
	const mockedSpeach = speech
		.map((line) => {
			return `Speaking [${line
				.map((group) => {
					return `'${group}'`;
				})
				.join(", ")}]\n`;
		})
		.join("");
	return fs.writeFile(logFilePath, mockedSpeach, { flag: "a" });
}

beforeAll(async () => {
	logFilePath = path.join(
		os.tmpdir(),
		"srtl-testing",
		`extendExpect-${new Date().valueOf()}.log`
	);
	await fs.mkdir(path.dirname(logFilePath), { recursive: true });
	await fs.writeFile(logFilePath, "", { flag: "w" });
	extendExpect(expect, logFilePath);
});

afterAll(async () => {
	await fs.unlink(logFilePath);
});

test("custom inline snapshot with no lines", async () => {
	await expect(async () => {
		await speakMock([]);
	}).toMatchSpeechInlineSnapshot(``);
});

test("custom inline snapshot with one line", async () => {
	const actualSpeech = [["banner landmark"]];
	await expect(async () => {
		await speakMock(actualSpeech);
	}).toMatchSpeechInlineSnapshot(`"banner landmark"`);
});

test("custom inline snapshot with two lines", async () => {
	const actualSpeech = [["banner landmark"], ["Search", "combobox"]];
	await expect(async () => {
		await speakMock(actualSpeech);
	}).toMatchSpeechInlineSnapshot(`
		"banner landmark"
		"Search, combobox"
	`);
});
