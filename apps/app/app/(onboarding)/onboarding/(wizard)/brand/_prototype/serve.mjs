import { outputDirectory } from './preview-output.mjs';
// THROWAWAY ONLY. A read-only replica at the real onboarding path, with fixture state.
// This runner deliberately does not boot auth, backend services, or generation jobs.

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The onboarding prototype is development-only.');
}
const directory = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(directory, '../../../../../../../..');
const assets = new Map([
  ['/prototype-assets/app.js', resolve(outputDirectory, 'app.generated.js')],
  ['/prototype-assets/app.css', resolve(outputDirectory, 'app.generated.css')],
  ['/prototype-assets/logo.svg', resolve(root, 'apps/app/public/logo.svg')],
  ['/prototype-assets/tokens.css', resolve(root, 'packages/ui/web-tokens.css')],
  [
    '/prototype-assets/satoshi.woff2',
    resolve(root, 'packages/fonts/files/Satoshi-Variable.woff2'),
  ],
  ...['poster.svg', 'video-poster.svg', 'first-video.mp4'].map((name) => [
    `/prototype-assets/${name}`,
    resolve(directory, name),
  ]),
]);
Bun.serve({
  hostname: '127.0.0.1',
  port: Number(process.env.PORT || 3000),
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === '/' || pathname === '/onboarding/brand') {
      return new Response(Bun.file(resolve(directory, 'index.html')), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }
    const asset = assets.get(pathname);
    if (asset) return new Response(Bun.file(asset));
    if (pathname === '/favicon.ico') return new Response(null, { status: 204 });
    return new Response('Prototype route not found', { status: 404 });
  },
});
console.log(
  `Onboarding prototype: ${process.env.PORTLESS_URL || 'development runner'}/onboarding/brand?variant=A`,
);
