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
			// Out: "['speech1', 'speech2', 'speech 3']"
			const listText = line.trim().replace(/^Speaking \[([^\]]+)\]/, "$1");

			// In: "['speech1', 'speech2', 'speech 3']"
			// Out: the corresponding array structure in JS with added quotes
			return listText
				.split(",")
				.map((rawSpeech) => {
					const speech = rawSpeech.trim();
					if (speech.startsWith("'")) {
						return speech.slice(1, -1);
					}
					// ignore commands for now
					return null;
				})
				.filter(
					/**
					 * @returns {speech is string}
					 */
					(speech) => speech !== null
				);
		});
}

module.exports = { extractSpeechLines };
