import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const appFolder = join(projectRoot, 'app');
const imageFolder = join(projectRoot, 'screenshots');
const dossierPath = join(destination, 'dossier.json');

function requireAppEntry() {
  const indexPath = join(appFolder, 'index.html');
  if (!existsSync(indexPath) || !statSync(indexPath).isFile()) {
    throw new Error(`Cannot build dossier: app entrypoint is missing (${indexPath}).`);
  }
}

function requireScreenshots() {
  if (!existsSync(imageFolder) || !statSync(imageFolder).isDirectory()) {
    throw new Error('Cannot build dossier: screenshots/ is missing; provide the app captures first.');
  }
  const visibleEntries = readdirSync(imageFolder).filter(entry => !entry.startsWith('.'));
  if (visibleEntries.length === 0) {
    throw new Error('Cannot build dossier: screenshots/ is empty; provide the app captures first.');
  }
}

function stageOutput() {
  mkdirSync(destination, { recursive: true });
  cpSync(appFolder, join(destination, 'app'), { recursive: true });
  cpSync(imageFolder, join(destination, 'screenshots'), { recursive: true });

  const dossier = buildDossier(destination, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648
  });
  writeFileSync(dossierPath, dossier);

  try {
    JSON.parse(readFileSync(dossierPath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot validate generated dossier JSON at ${dossierPath}: ${error.message}`);
  }
}

requireAppEntry();
requireScreenshots();
stageOutput();
