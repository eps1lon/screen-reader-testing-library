# Where you installed NVDA
$NVDA_BIN = "C:\Program Files (x86)\NVDA\nvda.exe"
# The path you cloned this repository to
$REPO_PATH = "C:\Users\eps1lon\Development\nvda-snapshot-testing"

# End of configuration. Changing anything below at your own risk
$Env:LOG_FILE_PATH = "$REPO_PATH\nvda.log"
& $NVDA_BIN --log-file=$Env:LOG_FILE_PATH --config-path=$REPO_PATH\sources\nvda-settings
yarn jest -c $REPO_PATH\examples\jest\jest.config.js
nvda -q