import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const dist = path.join(root, 'apps', 'docs', 'dist');

fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
fs.cpSync(path.join(root, 'public', 'r'), path.join(dist, 'r'), { recursive: true });
console.log('added 404.html, .nojekyll and r/');
