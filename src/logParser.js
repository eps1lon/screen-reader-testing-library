/**
 * @param {string} nvdaLog
 * @returns {string[][]}
 */
function extractSpeechLines(nvdaLog) {
	return nvdaLog
		.split(/\r?\n/)
		.filter((line) => {
			return line.startsWith("Speaking ");
		})
		.map((line) => {
			// In: "Speaking ['speech1', 'speech2', 'speech 3']"
			// Out: "'speech1', 'speech2', 'speech 3'"
			const listText = line.trim().replace(/^Speaking \[([^\]]+)\]/, "$1");

			// light-weight parser for
			// In: "'speech1', 'speech2, other', 'speech 3'"
			// Put: ['speech1', 'speech2, other', 'speech 3']
			/**
			 * @type {string[]}
			 */
			const spoken = [];
			/**
			 * @type {'type' | 'command' | 'speech'}
			 */
			let currentlyParsing = "type";
			let speech = "";
			for (const token of listText) {
				if (currentlyParsing === "type") {
					if (token === "'") {
						currentlyParsing = "speech";
					} else if (!/(\s|,)/.test(token)) {
						currentlyParsing = "command";
					}
				} else if (currentlyParsing === "command") {
					if (token === ",") {
						currentlyParsing = "type";
					}
				} else if (currentlyParsing === "speech") {
					if (token === "'") {
						spoken.push(speech);
						speech = "";
						currentlyParsing = "type";
					} else {
						speech += token;
					}
				}
			}

			return spoken;
		});
}

module.exports = { extractSpeechLines };
