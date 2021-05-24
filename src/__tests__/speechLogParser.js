const fs = require("fs");
const path = require("path");
const { extractSpeechLines } = require("../logParser.js");

it("can parse standard files", () => {
	const speechLog = fs.readFileSync(
		path.resolve(__dirname, "./__fixtures__/nvda.log"),
		{ encoding: "utf8" }
	);

	expect(extractSpeechLines(speechLog)).toMatchInlineSnapshot(`
		Array [
		  Array [
		    "Command Prompt",
		    "terminal",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>nvda.exe --log-file=\\"C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing\\\\\\\\nvda.log\\" --log-level=12                                                            ",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>nvda -q                                                                                                                                                     ",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>nvda -q                                                                                                                                                     ",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>node sources\\\\\\\\index.js \\"C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing\\\\\\\\nvda.log\\"                                                                         ",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>node sources\\\\\\\\index.js \\"C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing\\\\\\\\nvda.log\\"                                                                         ",
		  ],
		  Array [
		    "about:blank - Chromium",
		  ],
		  Array [
		    "Address and search bar",
		    "edit",
		    "has auto complete",
		    "Ctrl+L",
		  ],
		  Array [
		    "about:blank",
		  ],
		  Array [
		    "material-ui.com selected",
		  ],
		  Array [
		    "Material-UI: A popular React UI framework",
		  ],
		  Array [
		    "clickable",
		    "link",
		    "Skip to content",
		  ],
		  Array [
		    "banner landmark",
		    "button",
		    "Open main navigation",
		  ],
		  Array [
		    "clickable",
		    "Search",
		    "combo box",
		    "collapsed",
		    "has auto complete",
		    "editable",
		    "Search…",
		  ],
		  Array [
		    "menu button",
		    "subMenu",
		    "Change language",
		  ],
		  Array [
		    "menu button",
		    "subMenu",
		    "Toggle notifications panel",
		  ],
		  Array [
		    "link",
		    "Edit website colors",
		  ],
		  Array [
		    "link",
		    "GitHub repository",
		  ],
		  Array [
		    "button",
		    "Toggle light/dark theme",
		  ],
		  Array [
		    "button",
		    "Toggle right-to-left/left-to-right",
		  ],
		  Array [
		    "main landmark",
		    "heading",
		    "level 1",
		    "MATERIAL-UI",
		  ],
		  Array [
		    "banner landmark",
		  ],
		  Array [
		    "Search",
		    "combo box",
		    "expanded",
		    "has auto complete",
		    "editable",
		  ],
		  Array [
		    "Search…",
		  ],
		  Array [
		    "Link to the result",
		    "1 of 5",
		  ],
		  Array [
		    "Command Prompt - node  sources\\\\\\\\index.js \\"C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing\\\\\\\\nvda.log\\"",
		    "terminal",
		  ],
		  Array [
		    "blank",
		  ],
		]
	`);
});

it("ignores commands", () => {
	const speechLog = fs.readFileSync(
		path.resolve(__dirname, "./__fixtures__/nvda-speech-with-commands.log"),
		{ encoding: "utf8" }
	);

	expect(extractSpeechLines(speechLog)).toMatchInlineSnapshot(`
		Array [
		  Array [
		    "Material-UI: A popular React UI framework",
		  ],
		  Array [
		    "clickable",
		    "link",
		    "Skip to content",
		  ],
		  Array [
		    "banner landmark",
		    "button",
		    "Open main navigation",
		  ],
		  Array [
		    "clickable",
		    "Search",
		    "combo box",
		    "collapsed",
		    "has auto complete",
		    "editable",
		    "Search…",
		  ],
		  Array [
		    "menu button",
		    "subMenu",
		    "Change language",
		  ],
		  Array [
		    "menu button",
		    "subMenu",
		    "Toggle notifications panel",
		  ],
		  Array [
		    "link",
		    "Edit website colors",
		  ],
		  Array [
		    "link",
		    "GitHub repository",
		  ],
		  Array [
		    "button",
		    "Toggle light/dark theme",
		  ],
		  Array [
		    "button",
		    "Toggle right-to-left/left-to-right",
		  ],
		  Array [
		    "main landmark",
		    "heading",
		    "level 1",
		    "MATERIAL-UI",
		  ],
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
		  Array [
		    "Too much output to announce, navigate to rows manually to readteardown JestAssertionError: expect(received).toEqual(expected) // deep equality - Expected - 2 + Received + 2 Array [ Array [ + \\"angChangeCommand (\\\\",
		  ],
		  Array [
		    "nvda.ini (Working Tree) - nvda-snapshot-testing - Visual Studio Code",
		  ],
		  Array [
		    "nvda.ini (Working Tree) - nvda-snapshot-testing - Visual Studio Code",
		    "document",
		  ],
		  Array [
		    "application",
		  ],
		  Array [
		    "complementary landmark",
		  ],
		  Array [
		    "Terminal 2, PowerShell Integrated Console",
		    "edit",
		    "blank",
		  ],
		  Array [
		    "nvda-old.log",
		  ],
		  Array [
		    "complementary landmark",
		  ],
		  Array [
		    "Files Explorer",
		    "tree view",
		  ],
		]
	`);
});

it("is context sensitive", () => {
	expect(
		extractSpeechLines(
			"Speaking [LangChangeCommand ('en'), 'clickable', 'main landmark', 'button', 'Choose time, selected time is 12:00 AM']"
		)
	).toMatchInlineSnapshot(`
		Array [
		  Array [
		    "clickable",
		    "main landmark",
		    "button",
		    "Choose time, selected time is 12:00 AM",
		  ],
		]
	`);
});
