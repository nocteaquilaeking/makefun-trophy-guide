// Assemble the offline guide and its captured views, then create the exact make.fun dossier.
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const sourceShots = join(here, 'screenshots');
if (!existsSync(sourceShots) || !lstatSync(sourceShots).isDirectory()) {
  throw new Error('Cannot build entry: screenshots/ is missing or is not a directory. Add 3 or 4 real PNG/JPEG app screenshots first.');
}
if (!readdirSync(sourceShots, { withFileTypes: true }).some(entry => entry.isFile() && !entry.name.startsWith('.'))) {
  throw new Error('Cannot build entry: screenshots/ is empty. Add 3 or 4 real PNG/JPEG app screenshots first.');
}
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
cpSync(sourceShots, join(out, 'screenshots'), { recursive: true });
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
