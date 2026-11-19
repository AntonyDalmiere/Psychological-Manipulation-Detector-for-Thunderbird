#!/usr/bin/env node
/**
 * Build the source code archive (SCA) required by addons.thunderbird.net.
 *
 * The archive must contain everything needed to reproduce the shipped XPI and
 * nothing else: no node_modules, no build output, no CI configuration.
 * See https://webextension-api.thunderbird.net/en/mv3/guides/sourceCodeSubmission.html
 *
 * Uses the system `zip` binary so the build stays dependency-free.
 */

import { execFileSync } from 'child_process';
import { readFileSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const outFile = join(root, `psychological-manipulation-detector-${pkg.version}-source.zip`);

const EXCLUDES = [
  'node_modules/*',
  'dist/*',
  '.git/*',
  '.github/*',
  '.vscode/*',
  '*.xpi',
  '*-source.zip',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
];

rmSync(outFile, { force: true });

execFileSync('zip', ['-r', '-q', outFile, '.', '-x', ...EXCLUDES], { cwd: root, stdio: 'inherit' });

console.log(`Wrote ${outFile}`);
