# Psychological Manipulation Detector for Thunderbird
[![Thunderbird](https://img.shields.io/badge/Thunderbird-0A84FF?logo=thunderbird&logoColor=white)](https://addons.thunderbird.net/en-US/thunderbird/addon/psychological-manipulation/)
[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?logo=github&logoColor=white)](https://github.com/AntonyDalmiere/Psychological-Manipulation-Detector-for-Thunderbird)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.20545252.svg)](https://doi.org/10.5281/zenodo.20545252)



A Thunderbird extension that detects psychological manipulation techniques in emails using NLP and keyword analysis.

**Development Status:** In development at LAAS-CNRS  
**Academic Reference:** Implementation of *"Comprendre la cybermalveillance par la cognition sociale et la textométrie : le cas du phishing"* by Pascal Marchand, Antony Dalmiere, Vincent Nicomette, and Guillaume Auriol.

---

## System Requirements
Thunderbird >128.0

The interface is available in English and French. Thunderbird picks the locale
that best matches its own UI language and falls back to English.

---

## Build Environment

The review team rebuilds the add-on from this archive, so the instructions below
are written against a plain, freshly installed environment.

- **OS:** Ubuntu 24.04 (any Linux distribution works)
- **Node.js:** 20.19.5 ([nodejs.org](https://nodejs.org/en/download))
- **npm:** 10.5.0 (bundled with Node.js 20)

```bash
# Verify your toolchain
node --version   # v20.19.5
npm --version    # 10.5.0
```

### Build Instructions

1. **Install dependencies** (uses the committed `package-lock.json`):
   ```bash
   npm ci
   ```

2. **Validate TypeScript** (optional):
   ```bash
   npm run check
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Locate the .xpi file**:
   - Output: `dist/psychological-manipulation-detector.xpi`

5. **Lint the packaged add-on** (optional):
   ```bash
   npm run lint
   ```

### Build Script Details

The `npm run build` command executes:
```bash
webpack --mode production && node ./node_modules/web-ext/bin/web-ext.js build -o --source-dir dist --artifacts-dir dist --filename psychological-manipulation-detector.xpi
```

This performs:
- TypeScript compilation via webpack (production mode)
- Extension packaging into .xpi format using web-ext

No post-install step modifies `node_modules`, so a clean `npm ci` followed by
`npm run build` reproduces the shipped XPI byte for byte.

---

## Third-Party Code

The add-on needs a French Snowball stemmer. The upstream package
[`nlp-js-tools-french`](https://github.com/bastienbot/nlp-js-tools-french) ships
a POS tagger, a lemmatizer and nine dictionaries that this add-on never calls,
which pushed the package well past the 4 MB add-on size limit.

A trimmed copy is therefore vendored in `vendor/nlp-js-tools-french/` and
declared as a local package:

```json
"dependencies": {
  "nlp-js-tools-french": "file:./vendor/nlp-js-tools-french"
}
```

Only `stemmer()` and `wordStemmer()` are retained. The vendored copy has no
dependencies of its own. See `vendor/nlp-js-tools-french/NOTICE.md` for the
exact list of changes, which covers the trimmed entry point and a repair to the
stemmer's accented characters (upstream 1.0.9 ships them double-encoded, which
prevented accented suffixes from ever matching).

---

## Localization

All user-facing strings live in `_locales/<locale>/messages.json` and are read
through the `browser.i18n` API. English is the default locale.

- `_locales/en/messages.json` — English
- `_locales/fr/messages.json` — French

To add a language, copy `_locales/en/messages.json` to `_locales/<code>/` and
translate the `message` values. Keys must not be renamed: they are referenced
from `questionnaire.html` (`data-i18n` attributes), `questionnaire-data.ts`
(`textKey` / `answerKeys`) and the scripts.

---

## Source Code Archive

`npm run source` produces `psychological-manipulation-detector-<version>-source.zip`,
the archive to upload alongside the XPI. It contains the authored sources, the
lockfile, the vendored dependency and the build configuration, and excludes
`node_modules`, `dist`, `.git`, `.github` and `.vscode`.

---

## License

CC0-1.0 (Public Domain Dedication)

The vendored stemmer is MIT licensed (see `vendor/nlp-js-tools-french/LICENSE`)
and its Snowball implementation carries a BSD-style notice reproduced in
`vendor/nlp-js-tools-french/algos/stem.js`.

---

**Developer:** Antony Dalmiere, LAAS-CNRS  
**Version:** 1.2.0
