# The path you cloned this repository to
$REPO_PATH = "C:\Users\eps1lon\Development\nvda-snapshot-testing"
# The path where NVDA speech output is logged. Need read/write access.
$LOG_FILE_PATH = "$REPO_PATH\nvda.log"
# The path where your package manager installed the "screen-reader-testing-library" package.
$PACKAGE_PATH = "$REPO_PATH\node_modules\screen-reader-testing-library"

# End of configuration. Changing anything below at your own risk
$NVDA_BIN = "$PACKAGE_PATH\bin\nvda.ps1"
& $NVDA_BIN -logFile $LOG_FILE_PATH 
node $REPO_PATH\examples\node\index.js $LOG_FILE_PATH
& $NVDA_BIN -quit