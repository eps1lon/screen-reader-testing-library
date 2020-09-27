# The path you cloned this repository to
$REPO_PATH = "C:\Users\eps1lon\Development\nvda-snapshot-testing"

# End of configuration. Changing anything below at your own risk
$NVDA_VENDOR = "$REPO_PATH\vendor\nvda-2020.2"
$NVDA_BIN = "$NVDA_VENDOR\portable\nvda.exe"
$Env:LOG_FILE_PATH = "$REPO_PATH\nvda.log"
& $NVDA_BIN --log-file=$Env:LOG_FILE_PATH --config-path=$NVDA_VENDOR\settings
yarn jest -c $REPO_PATH\examples\jest\jest.config.js
& $NVDA_BIN -q