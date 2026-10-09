// CLI is pinned to the root devDependency version so CI doesn't drift with new shadcn releases.
// tsconfig omits baseUrl on purpose: TS 6 rejects it (TS5101) and the CLI resolves "@/*" from paths alone.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public', 'r');
const shadcnVersion = require('../package.json').devDependencies.shadcn.replace(/^[\^~]/, '');

execSync('npx shadcn build', { cwd: root, stdio: 'inherit' });
const names = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8')).items.map((i) => i.name);

const server = http.createServer((req, res) => {
  const file = path.join(out, path.basename(req.url));
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader('content-type', 'application/json');
  res.end(fs.readFileSync(file));
});

server.listen(4000, '127.0.0.1', () => {
  const args = [`shadcn@${shadcnVersion}`, 'add', ...names.map((n) => `@marcn/${n}`), '--overwrite', '--yes'];
  const child = spawn('npx', args, { cwd: path.join(root, 'apps', 'example'), stdio: 'inherit', shell: true });
  child.on('close', (code) => {
    server.close();
    process.exit(code ?? 1);
  });
});
