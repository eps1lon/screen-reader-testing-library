# Contributing

Before you install you need to make sure the install script uses the checked-in version of NVDA.
You have to set the environment variable `SRTL_DEV` to `true` before you install local packages.
Otherwise it will download the binaries from a the GitHub release for the currently checked out version of this library.

```bash
$ source .env.example
$ yarn
```

## Common workflows

### Bump NVDA

1. start NVDA
1. Right click status icon
1. Tools
1. Create portable copy
   - don't include current configuration
   - Remove documentation folder
