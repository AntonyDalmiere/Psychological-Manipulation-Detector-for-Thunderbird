# Vendored dependency: nlp-js-tools-french

This directory contains a trimmed copy of
[`nlp-js-tools-french`](https://github.com/bastienbot/nlp-js-tools-french)
version 1.0.9 by Bastien Botella, licensed under the MIT License (see
`LICENSE`).

It is declared in the root `package.json` as a local package
(`"nlp-js-tools-french": "file:./vendor/nlp-js-tools-french"`) so that it is
reviewed as part of the add-on submission, as required by the
[ATN source code submission guide](https://webextension-api.thunderbird.net/en/mv3/guides/sourceCodeSubmission.html).

## Changes from upstream 1.0.9

Files kept verbatim:

- `config.js`
- `logger.js`
- `algos/tokenize.js`

Files modified:

- `index.js` — reduced to the `stemmer()` and `wordStemmer()` entry points. The
  `posTagger()` and `lemmatizer()` methods were removed.
- `package.json` — rewritten for the vendored copy; the `lodash` dependency was
  dropped.
- `algos/stem.js` — the French Snowball stemmer (Copyright (c) 2010 Kasun
  Gajasinghe, BSD-style license reproduced in the file header). Upstream 1.0.9
  ships this file with its accented characters double-encoded as UTF-8, so the
  vowel class reads `[aeiouyÃ¢Ã Ã«Ã©ÃªÃ¨Ã¯Ã®Ã´Ã»Ã¹]` instead of
  `[aeiouyâàëéêèïîôûù]`. Accented vowels were therefore treated as consonants
  and suffixes such as `ité`, `ère` and `eux` never matched. The encoding was
  repaired in place; the stemming algorithm itself is unchanged. Against the
  official Snowball French test vocabulary (21,653 words) this raises
  conformance from 76.1% to 94.8%. The remaining gap is pre-existing and comes
  from the upstream implementation, not from this repair.

Files removed:

- `algos/find-tokens.js`, `algos/pos-tag.js`, `algos/lemmatize.js`
- `helpers.js` (the only consumer of `lodash`)
- `dict/` (adj, adv, art, conj, index, nom, ono, pre, pro, ver)
- `test/`, `README.md`, `.npmignore`

The add-on only ever called `stemmer()`, so the removed code was unreachable.
