const path = require("path");

module.exports = {
	// We only need this config due to our folder layout.
	// Usually you don't need to specify the path the the babel config.
	// We only need the babel config because our test is written in TypEscript useing ES modules.
	transform: {
		"^.+\\.[jt]sx?$": [
			"babel-jest",
			{ configFile: path.join(__dirname, "babel.config.js") },
		],
	},
};
