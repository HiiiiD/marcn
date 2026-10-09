// Verified against shadcn@latest (4.x) with empty tailwind fields: no dummy css, no pinned version needed.
// tsconfig omits baseUrl on purpose: TS 6 rejects it (TS5101) and the CLI resolves "@/*" from paths alone.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public', 'r');

execSync('npx shadcn build', { cwd: root, stdio: 'inherit' });
const names = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8')).items.map((i) => i.name);

const server = http.createServer((req, res) => {
  const file = path.join(out, path.basename(req.url));
  if (!fs.existsSync(file)) {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader('content-type', 'application/json');
  res.end(fs.readFileSync(file));
});

server.listen(4000, () => {
  const args = ['shadcn@latest', 'add', ...names.map((n) => `@marcn/${n}`), '--overwrite', '--yes'];
  const child = spawn('npx', args, { cwd: path.join(root, 'apps', 'example'), stdio: 'inherit', shell: true });
  child.on('close', (code) => {
    server.close();
    process.exit(code ?? 1);
  });
});
