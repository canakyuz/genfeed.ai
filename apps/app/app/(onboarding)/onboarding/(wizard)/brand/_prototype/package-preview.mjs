// Build the real React components, then embed every asset in the original portable HTML.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { outputDirectory } from './preview-output.mjs';

await import('./build-preview.mjs');
const directory = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(directory, '../../../../../../../..');
let html = await readFile(resolve(directory, 'index.html'), 'utf8');
let css = await readFile(resolve(outputDirectory, 'app.generated.css'), 'utf8');
let script = await readFile(
  resolve(outputDirectory, 'app.generated.js'),
  'utf8',
);
for (const [name, path, mime] of [
  [
    'satoshi.woff2',
    resolve(root, 'packages/fonts/files/Satoshi-Variable.woff2'),
    'font/woff2',
  ],
  ['logo.svg', resolve(root, 'apps/app/public/logo.svg'), 'image/svg+xml'],
  ['poster.svg', resolve(directory, 'poster.svg'), 'image/svg+xml'],
  ['video-poster.svg', resolve(directory, 'video-poster.svg'), 'image/svg+xml'],
  ['first-video.mp4', resolve(directory, 'first-video.mp4'), 'video/mp4'],
]) {
  const data = `data:${mime};base64,${(await readFile(path)).toString('base64')}`;
  css = css.replaceAll(`/prototype-assets/${name}`, data);
  script = script.replaceAll(`/prototype-assets/${name}`, data);
}
html = html.replace(
  '<link rel="stylesheet" href="/prototype-assets/app.css">',
  () => `<style>${css}</style>`,
);
html = html.replace(
  '<script src="/prototype-assets/app.js"></script>',
  () => `<script>${script.replaceAll('</script', '<\\/script')}</script>`,
);
const destination = process.argv[2] || '/tmp/genfeed-onboarding-prototype.html';
await writeFile(destination, html);
console.log(destination);
