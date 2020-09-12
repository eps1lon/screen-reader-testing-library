# NVDA snapshot testing

Runs tests in a browsers and verifies that the speech output matches existing snapshots

## Installation

- node as specified in `.nvmrc`
- install dependencies via `yarn`
- NVDA `2020.2`

## Getting started

Open `cmd.exe`
```bash
$ $NVDA_HOME\nvda.exe --log-file=$LOG_FILE
$ node sources/index.js $LOG_FILE
```
