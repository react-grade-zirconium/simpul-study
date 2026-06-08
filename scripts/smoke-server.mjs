import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.SMOKE_PORT || 5055);
const baseUrl = `http://127.0.0.1:${port}`;
const adminPassword = 'smoke-admin-password';
const server = spawn(process.execPath, ['server.mjs'], {
  env: {
    ...process.env,
    PORT: String(port),
    HOST: '127.0.0.1',
    ADMIN_PASSWORD: adminPassword,
    USAGE_DATA_DIR: 'data/smoke-test',
    USAGE_DATA_FILE: 'usage-stats.json'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
server.stdout.on('data', (chunk) => { output += chunk; });
server.stderr.on('data', (chunk) => { output += chunk; });

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { response, body };
}

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const { response, body } = await request('/api/health');
      if (response.ok && body.ok) return;
    } catch (_) {
      await delay(100);
    }
  }
  throw new Error(`Server did not become ready. Output:\n${output}`);
}

try {
  await waitForServer();

  const posted = await request('/api/usage-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'subject_open',
      visitorId: 'visitor-smoke-123',
      page: 'portal.html',
      subject: 'korean'
    })
  });
  assert.equal(posted.response.status, 202);
  assert.equal(posted.body.ok, true);

  const rejected = await request('/api/usage-stats');
  assert.equal(rejected.response.status, 401);

  const stats = await request('/api/usage-stats', {
    headers: { 'x-admin-password': adminPassword }
  });
  assert.equal(stats.response.status, 200);
  assert.equal(stats.body.ok, true);
  assert.equal(stats.body.totals.subjectOpens, 1);
  assert.equal(stats.body.totals.visitors, 1);

  console.log('Server smoke test passed');
} finally {
  server.kill('SIGTERM');
  await delay(100);
  await fs.rm('data/smoke-test', { recursive: true, force: true });
}
