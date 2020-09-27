# The path you cloned this repository to
$REPO_PATH = "C:\Users\eps1lon\Development\nvda-snapshot-testing"

# End of configuration. Changing anything below at your own risk
$NVDA_VENDOR = "$REPO_PATH\vendor\nvda-2020.2"
$NVDA_BIN = "$NVDA_VENDOR\portable\nvda.exe"
& $NVDA_BIN --log-file=$REPO_PATH\nvda.log --config-path=$NVDA_VENDOR\settings
node $REPO_PATH\examples\node\index.js $REPO_PATH\\nvda.log
& $NVDA_BIN -q