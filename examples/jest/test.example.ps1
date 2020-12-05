# The path you cloned this repository to
$REPO_PATH = "C:\Users\eps1lon\Development\nvda-snapshot-testing"
# The path where NVDA speech output is logged. Need read/write access.
$LOG_FILE_PATH = "$REPO_PATH\nvda.log"
# The path where your package manager installed the "screen-reader-testing-library" package.
$PACKAGE_PATH = "$REPO_PATH\node_modules\screen-reader-testing-library"

# End of configuration. Changing anything below at your own risk
$NVDA_BIN = "$PACKAGE_PATH\bin\nvda.ps1"
$Env:LOG_FILE_PATH = $LOG_FILE_PATH
& $NVDA_BIN -logFilePath $Env:LOG_FILE_PATH
yarn jest -c $REPO_PATH\examples\jest\jest.config.js
& $NVDA_BIN -quit