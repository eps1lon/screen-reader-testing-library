# The path you cloned this repository to
$REPO_PATH = "C:\Users\eps1lon\Development\nvda-snapshot-testing"
# The path where NVDA speech output is logged. Need read/write access.
$LOG_FILE_PATH = "$REPO_PATH\nvda.log"

# End of configuration. Changing anything below at your own risk
$NVDA_VENDOR = "$REPO_PATH\src\nvda"
$NVDA_BIN = "$NVDA_VENDOR\portable\nvda.exe"
$Env:LOG_FILE_PATH = $LOG_FILE_PATH
& $NVDA_BIN --log-file=$Env:LOG_FILE_PATH --config-path=$NVDA_VENDOR\settings
yarn jest -c $REPO_PATH\examples\jest\jest.config.js
& $NVDA_BIN -q