param ([switch] $quit, $logFilePath)

$CACHE_DIR = "$HOME\AppData\Local\screen-reader-testing-library"
$NVDA_VENDOR = "$CACHE_DIR\screen-readers\nvda-2020.3"
$NVDA_BIN = "$NVDA_VENDOR\portable\nvda.exe"

if ($logFilePath) {
  & $NVDA_BIN --config-path=$NVDA_VENDOR\settings --log-file=$logFilePath
}
elseif ($quit) {
  & $NVDA_BIN -q
}
else {
  throw "Either pass a -logFilePath or -quit NVDA."
}
