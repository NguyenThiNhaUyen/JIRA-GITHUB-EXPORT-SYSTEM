import fs from 'fs';
import path from 'path';
import { transformSync } from 'esbuild';

const srcDir = './src';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

console.log("Checking files for syntax errors...");

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      transformSync(code, {
        loader: filePath.endsWith('.jsx') ? 'jsx' : 'js',
        format: 'esm',
        target: 'esnext'
      });
    } catch (err) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${filePath}`);
      console.error(err.message);
      console.log('-----------------------------------');
    }
  }
});

console.log("Done.");
