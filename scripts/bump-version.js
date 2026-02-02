import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFile = path.resolve(__dirname, '..', 'public', 'version.txt');

function bump() {
  if (!fs.existsSync(versionFile)) {
    fs.writeFileSync(versionFile, 'v1', 'utf8');
    console.log('Created version.txt with v1');
    return;
  }

  const content = fs.readFileSync(versionFile, 'utf8').trim();
  const match = content.match(/^v(\d+)$/i);
  let next = 1;

  if (match) {
    next = parseInt(match[1], 10) + 1;
  }

  const newVersion = `v${next}`;
  fs.writeFileSync(versionFile, newVersion, 'utf8');
  console.log(`Bumped version to ${newVersion}`);

  try {
    execSync(`git add ${versionFile}`);
    execSync(`git commit -m "chore: bump version to ${newVersion}"`);
    console.log('Committed version bump');
  } catch (err) {
    console.warn('Could not commit version bump automatically:', err.message);
  }
}

bump();
