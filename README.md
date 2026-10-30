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


## Build Environment

### Required Software

**Node.js 18.x LTS** (18.19.0+)
```bash
# Install from https://nodejs.org/ (LTS version 18.x)
# Or use nvm:
nvm install 18
nvm use 18

# Verify installation
node --version  # Should output v18.x.x
npm --version   # Should output 9.x or higher
```

**npm 9.x+** (comes bundled with Node.js 18.x)


### Build Instructions

1. **Install dependencies**:
   ```bash
   npm install
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

### Build Script Details

The `npm run build` command executes:
```bash
webpack --mode production && node ./node_modules/web-ext/bin/web-ext.js build -o --source-dir dist --artifacts-dir dist --filename psychological-manipulation-detector.xpi
```

This performs:
- TypeScript compilation via webpack (production mode)
- Extension packaging into .xpi format using web-ext
- Patching: this project uses `patch-package` to apply custom modifications to third-party dependencies. A patch file (`patches/nlp-js-tools-french+1.0.9.patch`) strip out big JS tables from `nlp-js-tools-french` to comply with <4MB limit of thunderbird addon store. The patch is automatically applied during `npm install` via the `postinstall` script.

---

## License

CC0-1.0 (Public Domain Dedication)

---

**Developer:** Antony Dalmiere, LAAS-CNRS  
**Version:** 1.1.0