---
"screen-reader-testing-library": patch
---

Speech containing a comma is no longer truncated

For example, `Choose time, selected time is ...` previously resulted in `["Choose tim"]`.
The previous speech parser only used a regular expression which cannot handle context-sensitive languages.
