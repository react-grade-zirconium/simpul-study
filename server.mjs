import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const staticAssetPattern = /\.(?:css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/i;

app.use(express.static(rootDir, {
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (staticAssetPattern.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.listen(port, () => {
  console.log(`SIMPUL server listening on http://localhost:${port}`);
});
