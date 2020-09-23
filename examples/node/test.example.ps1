# Where you installed NVDA
$NVDA_BIN = "C:\Program Files (x86)\NVDA\nvda.exe"
# The path you cloned this repository to
$REPO_PATH = "C:\Users\eps1lon\Development\nvda-snapshot-testing"

# End of configuration. Changing anything below at your own risk
& $NVDA_BIN --log-file=$REPO_PATH\nvda.log --config-path=$REPO_PATH\src\nvda-settings
node $REPO_PATH\examples\node\index.js $REPO_PATH\\nvda.log
nvda -q