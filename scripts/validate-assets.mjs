import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'data']);
const attrPattern = /(?:href|src)="([^"#]+)"/g;
const ignoredProtocols = /^(?:https?:|mailto:|tel:|javascript:|about:|data:)/i;
const htmlFiles = [];
const missing = [];

function collectHtmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectHtmlFiles(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(path.relative(rootDir, fullPath));
    }
  }
}

collectHtmlFiles(rootDir);
htmlFiles.sort();

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(path.join(rootDir, htmlFile), 'utf8');
  for (const match of html.matchAll(attrPattern)) {
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

console.log(`Validated local asset references in ${htmlFiles.length} HTML files`);
