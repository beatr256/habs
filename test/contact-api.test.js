const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

const startServer = () => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: '4010',
      EMAIL_TO: 'example@example.com',
      EMAIL_HOST: '',
      EMAIL_PORT: '',
      EMAIL_USER: '',
      EMAIL_PASS: ''
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  const timeout = setTimeout(() => {
    child.kill();
    reject(new Error(`Timed out starting server. Output: ${output}`));
  }, 10000);

  const check = setInterval(() => {
    if (output.includes('Server running on')) {
      clearInterval(check);
      clearTimeout(timeout);
      resolve(child);
    }
  }, 100);

  child.on('exit', (code) => {
    if (code !== null) {
      clearInterval(check);
      clearTimeout(timeout);
      reject(new Error(`Server exited early with code ${code}. Output: ${output}`));
    }
  });
});

test('POST /api/contact accepts valid inquiry payload', async () => {
  const child = await startServer();

  try {
    const response = await fetch('http://localhost:4010/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'I want a 5-day gorilla safari.'
      })
    });

    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.match(body.message, /received/i);
  } finally {
    child.kill();
  }
});

test('POST /api/contact rejects missing fields', async () => {
  const child = await startServer();

  try {
    const response = await fetch('http://localhost:4010/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Jane Doe' })
    });

    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
  } finally {
    child.kill();
  }
});
