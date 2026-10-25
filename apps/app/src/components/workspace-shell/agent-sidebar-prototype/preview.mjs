// Throwaway exporter: bundles the actual shared React controls and app styles into one offline HTML page.
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../../../../..');
const require = createRequire(import.meta.url);
const esbuild = require('esbuild');
const postcss = createRequire(require.resolve('@tailwindcss/postcss'))(
  'postcss',
);
const tailwind = require('@tailwindcss/postcss');
const exportPath =
  process.argv[2] === '--export'
    ? process.argv[3]
    : resolve(process.env.HOME, '.codex/artifacts/agent-sidebar-preview.html');
if (!exportPath) throw new Error('Provide an HTML output path after --export.');
if (process.env.NODE_ENV === 'production')
  throw new Error('This throwaway exporter is development-only.');

const bundle = await esbuild.build({
  absWorkingDir: root,
  entryPoints: [resolve(import.meta.dirname, 'standalone.tsx')],
  bundle: true,
  write: false,
  minify: true,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
  tsconfig: resolve(root, 'apps/app/tsconfig.json'),
  nodePaths: (process.env.NODE_PATH ?? '').split(':').filter(Boolean),
  metafile: true,
  plugins: [
    {
      name: 'shared-source-resolution',
      setup(build) {
        // The actual barrel export is this same cn function; narrow its source import to avoid unrelated server helpers.
        build.onResolve({ filter: /^@genfeedai\/helpers$/ }, () => ({
          path: resolve(root, 'packages/helpers/src/formatting/cn/cn.util.ts'),
        }));
        build.onResolve({ filter: /^@ui\// }, async ({ path }) => {
          for (const base of [
            'packages/ui/src',
            'packages/ui/src/components',
          ]) {
            for (const suffix of [
              '',
              '.tsx',
              '.ts',
              '/index.tsx',
              '/index.ts',
            ]) {
              const target = resolve(root, base, path.slice(4) + suffix);
              if (await Bun.file(target).exists()) return { path: target };
            }
          }
        });
      },
    },
  ],
});
const stylePath = resolve(root, 'apps/app/app/styles.css');
const cssResult = await postcss([
  tailwind({ base: root, optimize: true }),
]).process(await readFile(stylePath, 'utf8'), { from: stylePath });
const { staticSurfaceFontCss } = await import(
  resolve(root, 'packages/ui/src/static/font.ts')
);
const css =
  cssResult.css +
  staticSurfaceFontCss +
  '\nbody{margin:0;padding:0 12px;font-family:var(--font-satoshi),sans-serif}';
const js = bundle.outputFiles[0].text.replaceAll('</script', '<\\/script');
const html = `<!doctype html><html lang="en" data-theme="dark" style="color-scheme:dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent sidebar prototype</title><style>${css}</style></head><body class="gf-app gf-studio-app"><div id="agent-sidebar-root"></div><script>${js}</script></body></html>`;
await mkdir(dirname(exportPath), { recursive: true });
await Bun.write(exportPath, html);
const shared = Object.keys(bundle.metafile.inputs).filter((path) =>
  /packages\/ui\/src\/(primitives\/(tabs|button|textarea|dropdown-menu)|components\/(card\/Card|prompt-bars))/.test(
    path,
  ),
);
console.info(
  JSON.stringify(
    { output: exportPath, bytes: html.length, sharedComponentSources: shared },
    null,
    2,
  ),
);
