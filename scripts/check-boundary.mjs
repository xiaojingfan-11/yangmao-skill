import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const excluded = new Set(['.git', 'node_modules', 'dist', 'coverage']);
const textExtensions = new Set(['.md', '.ts', '.js', '.mjs', '.json', '.yaml', '.yml']);
const forbidden = [
  /聚推客|福禄/iu,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/u,
  /(?:api[_-]?key|secret|publisher[_-]?id)\s*[:=]\s*['"][^'"]{8,}/iu,
  /raw_payload_encrypted/iu,
  /commission[_-]reconciliation/iu,
];

async function files(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await files(path)));
    else if (textExtensions.has(extname(entry.name))) output.push(path);
  }
  return output;
}

const violations = [];
for (const path of await files(root)) {
  if (path.endsWith(join('scripts', 'check-boundary.mjs'))) continue;
  const content = await readFile(path, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(content)) violations.push(`${relative(root, path)} matched ${pattern}`);
  }
}
if (violations.length > 0) {
  process.stderr.write(`${violations.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('Public repository boundary check passed.\n');
}
