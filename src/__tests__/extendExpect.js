const { extendExpect } = require("../index");

extendExpect(expect, "unused");

test("custom inline snapshot with no lines", () => {
	expect([]).toMatchSpeechInlineSnapshot(``);
});

test("custom inline snapshot with one line", () => {
	const actualSpeech = [["banner landmark"]];
	expect(actualSpeech).toMatchSpeechInlineSnapshot(`"banner landmark"`);
});

test("custom inline snapshot with two lines", () => {
	const actualSpeech = [["banner landmark"], ["Search", "combobox"]];
	expect(actualSpeech).toMatchSpeechInlineSnapshot(`
		"banner landmark"
		"Search, combobox"
	`);
});
