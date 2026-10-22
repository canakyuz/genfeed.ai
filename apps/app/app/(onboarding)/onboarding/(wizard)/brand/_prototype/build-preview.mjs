import { outputDirectory } from './preview-output.mjs';
// Build only the throwaway preview, directly from the application's existing UI sources.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(directory, '../../../../../../../..');
const require = createRequire(resolve(root, 'package.json'));
const postcss = createRequire(require.resolve('@tailwindcss/postcss'))(
  'postcss',
);
const tailwind = require('@tailwindcss/postcss');
await mkdir(outputDirectory, { recursive: true });
const css = await readFile(resolve(directory, 'prototype.css'), 'utf8');
const input = `@import "${root}/packages/styles/globals.css";\n@source "${root}/packages/ui/src";\n@source "${directory}/onboarding-prototype.tsx";\n@source "${root}/apps/app/app/(onboarding)/onboarding/components/onboarding-progress.tsx";\n${css}`;
const result = await postcss([
  tailwind({ base: root, optimize: true }),
]).process(input, { from: resolve(directory, 'prototype.entry.css') });
await writeFile(resolve(outputDirectory, 'app.generated.css'), result.css);
const appConfig = JSON.parse(
  await readFile(resolve(root, 'apps/app/tsconfig.json'), 'utf8'),
);
const paths = Object.fromEntries(
  Object.entries(appConfig.compilerOptions.paths).map(([key, values]) => [
    key,
    values.map((value) => resolve(root, 'apps/app', value)),
  ]),
);
paths['@genfeedai/ui/*'] = [
  resolve(root, 'packages/ui/src/*'),
  resolve(root, 'packages/ui/src/components/*'),
];
const configPath = resolve(
  '/tmp',
  `onboarding-prototype-${process.pid}.tsconfig.json`,
);
await writeFile(
  configPath,
  JSON.stringify({
    extends: resolve(root, 'apps/app/tsconfig.json'),
    compilerOptions: { paths },
  }),
);
const child = Bun.spawn(
  [
    process.execPath,
    'build',
    '--tsconfig-override',
    configPath,
    resolve(directory, 'onboarding-prototype.tsx'),
    '--target',
    'browser',
    '--format',
    'iife',
    '--minify',
    '--define',
    'process.env.NODE_ENV="production"',
    '--define',
    'process.env={}',
    '--define',
    'global=globalThis',
    '--outfile',
    resolve(outputDirectory, 'app.generated.js'),
  ],
  { cwd: root, stdout: 'inherit', stderr: 'inherit' },
);
if ((await child.exited) !== 0)
  throw new Error('Could not bundle the shared UI preview');
console.log('Built onboarding preview from shared application components.');
