import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const app = join(root, 'app');
const captures = join(root, 'screenshots');

if (!existsSync(join(app, 'index.html'))) throw new Error('app/index.html is required.');
if (!existsSync(captures) || !statSync(captures).isDirectory()) throw new Error('screenshots/ must exist.');
const images = readdirSync(captures).filter(name => !name.startsWith('.'));
if (images.length === 0 || !images.some(name => name.toLowerCase().endsWith('.jpg'))) {
  throw new Error('screenshots/ must contain files and at least one JPG image.');
}

mkdirSync(output, { recursive: true });
cpSync(app, join(output, 'app'), { recursive: true });
cpSync(captures, join(output, 'screenshots'), { recursive: true });
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648
});
const dossierFile = join(output, 'dossier.json');
writeFileSync(dossierFile, dossier);
if (!existsSync(dossierFile) || statSync(dossierFile).size === 0) throw new Error('dossier.json was not written.');
let parsedDossier: { text?: unknown };
try {
  parsedDossier = JSON.parse(readFileSync(dossierFile, 'utf8'));
} catch (error) {
  throw new Error(`dossier.json could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
}
const appOutput = join(output, 'app');
function countAppFiles(directory: string): number {
  return readdirSync(directory, { withFileTypes: true }).reduce((count, entry) => {
    const path = join(directory, entry.name);
    return count + (entry.isDirectory() ? countAppFiles(path) : entry.isFile() ? 1 : 0);
  }, 0);
}
const match = typeof parsedDossier.text === 'string' ? parsedDossier.text.match(/Whole app: (\d+) files?\b/) : null;
if (!match) throw new Error('dossier.json does not record a readable whole app file count.');
const recordedAppFiles = Number(match[1]);
const copiedAppFiles = countAppFiles(appOutput);
if (recordedAppFiles !== copiedAppFiles) {
  throw new Error(`dossier.json app file count mismatch: it records ${recordedAppFiles}, but output app/ contains ${copiedAppFiles} files.`);
}
