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
- `algos/stem.js` (French Snowball stemmer, Copyright (c) 2010 Kasun Gajasinghe, BSD-style license reproduced in the file header)

Files modified:

- `index.js` — reduced to the `stemmer()` and `wordStemmer()` entry points. The
  `posTagger()` and `lemmatizer()` methods were removed.
- `package.json` — rewritten for the vendored copy; the `lodash` dependency was
  dropped.

Files removed:

- `algos/find-tokens.js`, `algos/pos-tag.js`, `algos/lemmatize.js`
- `helpers.js` (the only consumer of `lodash`)
- `dict/` (adj, adv, art, conj, index, nom, ono, pre, pro, ver)
- `test/`, `README.md`, `.npmignore`

The add-on only ever called `stemmer()`, so the removed code was unreachable.
