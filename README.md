# `kpipe-url`

Translate URL-like paths into Kpipe backend stream generators.

| Pattern | Backend | Description |
|---|---|---|
| stdio://  <br/> - | `stdio` | |
| fs://[path]/[file].[ext] <br/> file://[path]/[file].[ext] | `fs` | |
| s3://[bucket]\(/[prefix]\)/[file].[ext] | `s3` | |
| kafka://[topic]\(/[partition]\(/[offset]\)\)| `kafka` | |
