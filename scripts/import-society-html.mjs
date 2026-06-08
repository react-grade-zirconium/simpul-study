import { copyFile, access } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const defaultSource = 'C:/Users/a3327/Downloads/통합사회_4단원_정리.html';
const source = process.env.SIMPUL_SOCIETY_HTML_PATH || defaultSource;
const target = path.join(rootDir, '통합사회_4단원_정리.html');

await access(source).catch(() => {
  console.error(`Original society HTML was not found: ${source}`);
  console.error('Place the original file at that path, or set SIMPUL_SOCIETY_HTML_PATH to the exact HTML file path.');
  process.exit(1);
});
await copyFile(source, target);

console.log(`Copied original society HTML without modification:\n${source}\n-> ${target}`);
