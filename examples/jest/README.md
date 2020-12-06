# NVDA snapshot testing

Check out [`index.test.ts`](./index.test.ts) when you want to use `jest` as a test runner.

## Installation

- Windows with powershell
- node 14.x
- install dependencies via `yarn`

## Getting started

1. Open a PowerShell
2. Replace the commands found in `test.example.ps1`
   Executing `test.example.ps1` directly (with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`) will not bring the opened browser window to the front.

## Known issues

- Running `jest` in watchmode causes empty recorded speech outputs and NVDA freezing.
