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
1. Create portable copy in `vendor/nvda-${NEW_REVISION_NUMBER}/portable`
   - don't include current configuration
   - Remove `documentation` folder
   - Remove all folders in `locale` except `en` i.e. only include english
1. Update the `revision` in `src/screenReaders.json`
1. Update the revision in `src/bin/nvda.ps1`
1. On the next release attach a zip of `vendor/nvda-${NEW_REVISION_NUMBER}/*`
   Be sure that you create an archive of the folders inside `nvda-${REVISION_NUMBER}` not the folder itself.
