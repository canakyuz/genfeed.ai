// Builds a portable, double-clickable artifact. Run only on the configured execution host.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(directory, '../../../../../../../..');
let html = await readFile(resolve(directory, 'index.html'), 'utf8');
const tokens = await readFile(
  resolve(root, 'packages/ui/web-tokens.css'),
  'utf8',
);
html = html.replace(
  '<link rel="stylesheet" href="/prototype-assets/tokens.css" id="shared-tokens">',
  `<style>${tokens}</style>`,
);
for (const [name, path, mime] of [
  [
    'satoshi.woff2',
    resolve(root, 'packages/fonts/files/Satoshi-Variable.woff2'),
    'font/woff2',
  ],
  ['poster.svg', resolve(directory, 'poster.svg'), 'image/svg+xml'],
  ['video-poster.svg', resolve(directory, 'video-poster.svg'), 'image/svg+xml'],
  ['first-video.mp4', resolve(directory, 'first-video.mp4'), 'video/mp4'],
]) {
  const data = (await readFile(path)).toString('base64');
  html = html.replaceAll(
    `/prototype-assets/${name}`,
    `data:${mime};base64,${data}`,
  );
}
const destination = process.argv[2] || '/tmp/genfeed-onboarding-prototype.html';
await writeFile(destination, html);
console.log(destination);
