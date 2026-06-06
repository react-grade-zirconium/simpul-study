import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const htmlFiles = ['index.html', 'portal.html', ...findHtmlFiles('subjects')];
const localRefPattern = /(?:href|src|data-src)="([^"#]+)"/g;
const ignoredProtocols = /^(?:https?:|mailto:|tel:|javascript:|about:|data:)/i;
const missing = [];

function findHtmlFiles(dir) {
  const absoluteDir = path.join(rootDir, dir);
  if (!fs.existsSync(absoluteDir)) return [];
  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(relativePath);
    return entry.isFile() && entry.name.endsWith('.html') ? [relativePath] : [];
  });
}

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(path.join(rootDir, htmlFile), 'utf8');
  for (const match of html.matchAll(localRefPattern)) {
    const ref = match[1];
    if (ignoredProtocols.test(ref) || ref.startsWith('#')) continue;
    const cleanRef = ref.split(/[?#]/, 1)[0];
    const target = path.resolve(rootDir, path.dirname(htmlFile), cleanRef);
    if (!fs.existsSync(target)) missing.push(`${htmlFile} -> ${ref}`);
  }
}

if (missing.length) {
  console.error('Missing local assets:');
  for (const ref of missing) console.error(`- ${ref}`);
  process.exit(1);
}

console.log(`Validated local references in ${htmlFiles.join(', ')}`);
