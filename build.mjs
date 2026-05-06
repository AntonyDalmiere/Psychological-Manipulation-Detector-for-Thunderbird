import * as esbuild from 'esbuild';
import { cp } from 'fs/promises';
import { readdirSync } from 'fs';
import { join } from 'path';

// Recursively get all JS/TS files from a module, excluding specified directories
function getModuleFiles(modulePath, excludeDirs = ['test']) {
  const files = [];
  function walk(dir) {
    for (const file of readdirSync(dir, { withFileTypes: true })) {
      if (file.isDirectory() && !excludeDirs.includes(file.name)) {
        walk(join(dir, file.name));
      } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.ts'))) {
        files.push(join(dir, file.name).replace(/\\/g, '/'));
      }
    }
  }
  walk(modulePath);
  return files;
}

const watch = process.argv[2] === '--watch';

const config = {
  entryPoints: [
    'background.ts', 
    'banner-content-script.ts',
    ...getModuleFiles('node_modules/nlp-js-tools-french')
  ],
  outdir: 'dist',
  bundle: true,
  splitting: true,
  format: 'esm',
  target: 'es6',
  minify: true,
  sourcemap: true,
  logLevel: 'info',
};

// Copy static assets
const copyAssets = async () => {
  await Promise.all([
    cp('manifest.json', 'dist/manifest.json'),
    cp('banner.css', 'dist/banner.css'),
    cp('icons', 'dist/icons', { recursive: true })
  ]);
};

const build = async () => {
  try {
    if (watch) {
      const ctx = await esbuild.context(config);
      await copyAssets();
      await ctx.watch();
      console.log('Watching for changes...');
    } else {
      await esbuild.build(config);
      await copyAssets();
      console.log('Build complete');
    }
  } catch (error) {
    process.exit(1);
  }
};

build();
