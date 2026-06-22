import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const htmlFiles = fs.readdirSync(rootDir)
  .filter((file) => file.endsWith('.html'))
  .sort();
const attrPattern = /(?:href|src)="([^"#]+)"/g;
const ignoredProtocols = /^(?:https?:|mailto:|tel:|javascript:|about:|data:)/i;
const missing = [];

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(path.join(rootDir, htmlFile), 'utf8');
  for (const match of html.matchAll(attrPattern)) {
    const ref = match[1];
    if (ignoredProtocols.test(ref) || ref.startsWith('#') || ref.includes('{{') || ref.includes('+') || ref.endsWith('/')) continue;
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

console.log(`Validated local asset references in ${htmlFiles.join(', ')}`);
