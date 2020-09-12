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
		    "speech.commands.CallbackCommand object at 0x03A95250",
		    "clickable",
		    "link",
		    "Skip to content",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03A95CB0",
		    "banner landmark",
		    "button",
		    "Open main navigation",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03A950D0",
		    "clickable",
		    "Search",
		    "combo box",
		    "collapsed",
		    "has auto complete",
		    "editable",
		    "Search…",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03AC2F70",
		    "menu button",
		    "subMenu",
		    "Change language",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03A86FF0",
		    "menu button",
		    "subMenu",
		    "Toggle notifications panel",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03ACA950",
		    "link",
		    "Edit website colors",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03ACAEB0",
		    "link",
		    "GitHub repository",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03ACF790",
		    "button",
		    "Toggle light/dark theme",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03ACFF10",
		    "button",
		    "Toggle right-to-left/left-to-right",
		  ],
		  Array [
		    "speech.commands.CallbackCommand object at 0x03AD46D0",
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
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>                                                                                                                                                            ",
		  ],
		  Array [
		    "  [ \\"peaking [\\\\'banner landmark\\\\'",
		    "",
		  ],
		  Array [
		    "Speaking ['Search…'                                                                                                                                                                                           \\"",
		  ],
		  Array [
		    "\\"Speaking [\\\\'Search…\\\\'\\"                                                                                                                                                                                         '",
		  ],
		  Array [
		    "    'expanded",
		    "",
		  ],
		  Array [
		    "    'combo box",
		    "",
		  ],
		  Array [
		    "    \\"peaking [\\\\'Search",
		    "",
		  ],
		  Array [
		    "  [                                                                                                                                                                                                            ",
		  ],
		  Array [
		    "  [ \\"peaking [\\\\'banner landmark\\\\'",
		    "",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>node sources\\\\\\\\index.js \\"C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing\\\\\\\\nvda.log\\"                                                                         ",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>node sources\\\\\\\\index.js \\"C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing\\\\\\\\nvda.log\\"                                                                         ",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>nvda.exe --log-file=\\"C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing\\\\\\\\nvda.log\\" --log-level=12                                                            ",
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
		    "unavailable",
		  ],
		  Array [
		    "C:\\\\\\\\Users\\\\\\\\eps1lon\\\\\\\\Development\\\\\\\\nvda-snapshot-testing>                                                                                                                                                            ",
		  ],
		]
	`);
});
