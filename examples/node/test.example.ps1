# The path you cloned this repository to
$REPO_PATH = "C:\Users\eps1lon\Development\nvda-snapshot-testing"
# The path where NVDA speech output is logged. Need read/write access.
$LOG_FILE_PATH = "$REPO_PATH\nvda.log"

# End of configuration. Changing anything below at your own risk
$NVDA_VENDOR = "$REPO_PATH\src\nvda-2020.2"
$NVDA_BIN = "$NVDA_VENDOR\portable\nvda.exe"
& $NVDA_BIN --log-file=$LOG_FILE_PATH --config-path=$NVDA_VENDOR\settings
node $REPO_PATH\examples\node\index.js $LOG_FILE_PATH
& $NVDA_BIN -q