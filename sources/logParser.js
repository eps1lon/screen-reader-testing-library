/**
 * @param {string} nvdaLog
 */
function extractSpeechLines(nvdaLog) {
	return nvdaLog
		.split(/\r?\n/)
		.filter((line) => {
			return line.startsWith("Speaking ");
		})
		.map((line) => {
			// In: "Speaking ['speech1', 'speech2', 'speech 3']"
			// Out: "['speech1', 'speech2', 'speech 3']""
			const listText = line.trim().replace(/^Speaking \[([^\]]+)\]/, "$1");

			// In: "['speech1', 'speech2', 'speech 3']"
			// Out: the corresponding array structure in JS
			return listText.split(",").map((quotedSpeech) => {
				return quotedSpeech.trim().slice(1, -1);
			});
		});
}

module.exports = { extractSpeechLines };
