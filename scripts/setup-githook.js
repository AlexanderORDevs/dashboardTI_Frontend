import fs from 'fs';
import path from 'path';

const hookPath = path.resolve('.git', 'hooks', 'post-commit');
const script = `#!/bin/sh
# Run bump version after each commit to invalidate client cache
npm run bump:version || true
`;

try {
  fs.writeFileSync(hookPath, script, { mode: 0o755 });
  console.log('Installed post-commit git hook.');
} catch (err) {
  console.error('Failed to install git hook:', err.message);
  process.exitCode = 1;
}
