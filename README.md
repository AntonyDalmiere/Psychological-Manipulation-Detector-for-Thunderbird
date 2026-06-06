# Psychological Manipulation Detector for Thunderbird

A Thunderbird extension that detects psychological manipulation techniques in emails using NLP and keyword analysis.

**Development Status:** In development at LAAS-CNRS  
**Academic Reference:** Implementation of *"Comprendre la cybermalveillance par la cognition sociale et la textométrie : le cas du phishing"* by Pascal Marchand, Antony Dalmiere, Vincent Nicomette, and Guillaume Auriol.

---

## System Requirements

### Operating Systems
- **Windows**: Windows 10 (1903) or later, Windows 11
- **Linux**: Any modern distribution with glibc 2.17+
- **macOS**: macOS 10.15 (Catalina) or later

### Thunderbird
- **Minimum Version**: Thunderbird 128.0 (ESR)
- **Manifest Version**: 3 (MV3)

---

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

---

## Build Instructions

### Step-by-Step Process

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

---

## Installation

### Development Installation

1. Build the extension (see [Build Instructions](#build-instructions))
2. Open Thunderbird
3. Navigate to **Tools** → **Add-ons and Themes**
4. Click the gear icon (⚙️) → **"Install Add-on From File..."**
5. Select `dist/psychological-manipulation-detector.xpi`
6. Confirm installation and restart Thunderbird if prompted

---

## Source Code Structure

### Source Files

```
thunderbird_ext/
├── background.ts                 # Background service worker
├── banner-content-script.ts      # Content script for message viewer
├── banner.css                    # Banner styling
├── keyword.ts                    # Manipulation technique keywords
├── manifest.json                 # Extension manifest (MV3)
├── webpack.config.js             # Build configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── icons/
│   ├── icon-48.png
│   └── icon-96.png
└── patches/
    └── nlp-js-tools-french+1.0.9.patch
```

All source files are provided in original, non-transpiled form. Only the final build output (`dist/*.js`) is compiled.

---

## Dependencies

### Runtime
| Package | Version | Purpose |
|---------|---------|---------|
| `nlp-js-tools-french` | ^1.0.9 | French NLP tokenization/stemming |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.0.0 | TypeScript compiler |
| `webpack` | ^5.106.2 | Module bundler |
| `web-ext` | ^7.0.0 | Extension packaging |
| `ts-loader` | ^9.5.7 | TypeScript webpack loader |
| `@types/firefox-webext-browser` | ^120.0.0 | WebExtensions types |

---

## Patching

This project uses `patch-package` to apply custom modifications to third-party dependencies. A patch file (`patches/nlp-js-tools-french+1.0.9.patch`) strip out big JS tables from `nlp-js-tools-french` to comply with <4MB limit of thunderbird addon store. The patch is automatically applied during `npm install` via the `postinstall` script.

---


---

## License

CC0-1.0 (Public Domain Dedication)

---

**Developer:** Antony Dalmiere, LAAS-CNRS  
**Version:** 1.0.2