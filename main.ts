// Static trophy guide hand-in: copy its offline app and maker screenshots, then write the deterministic dossier.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const screenshots = join(here, 'screenshots');
if (!existsSync(screenshots) || !statSync(screenshots).isDirectory() || readdirSync(screenshots).filter(name => !name.startsWith('.')).length === 0) {
  throw new Error('Cannot build dossier: screenshots/ is missing or empty; add 3 or 4 app screenshots first.');
}
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(screenshots, join(out, 'screenshots'), { recursive: true });
writeFileSync(join(out, 'dossier.json'), buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }));
