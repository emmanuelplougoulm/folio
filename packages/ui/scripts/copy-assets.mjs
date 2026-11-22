// Copie dans dist les fichiers exposés hors du bundle : base.css, fonts.css et les tokens JSON.
import { cp, mkdir } from 'node:fs/promises';

await mkdir('dist/tokens', { recursive: true });
await cp('src/styles/base.css', 'dist/base.css');
await cp('src/styles/fonts.css', 'dist/fonts.css');
for (const theme of ['light', 'dark']) {
  await cp(`src/styles/tokens-${theme}.generated.json`, `dist/tokens/${theme}.json`);
}
