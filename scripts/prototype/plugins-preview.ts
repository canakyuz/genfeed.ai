// Run from repository root: bun run prototype:plugins. Throwaway issue #7842.
import { spawn } from 'node:child_process';

const env = {
  ...process.env,
  PLUGINS_PROTOTYPE: '1',
  PLAYWRIGHT_TEST: 'true',
  NEXT_PUBLIC_PLAYWRIGHT_TEST: 'true',
  NEXT_PUBLIC_POSTHOG_KEY: '',
  NEXT_PUBLIC_SENTRY_DSN: '',
  SENTRY_DSN: '',
};
const children = [
  spawn(
    'bun',
    [
      'run',
      'scripts/dev/run-portless.ts',
      'api',
      '--',
      'bun',
      '--tsconfig-override=apps/app/tsconfig.json',
      'scripts/prototype/plugins-mock-api.ts',
    ],
    { env, stdio: 'inherit' },
  ),
  spawn('bun', ['run', 'dev:app'], { env, stdio: 'inherit' }),
];
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    for (const child of children) child.kill('SIGTERM');
  });
for (const child of children)
  child.on('exit', (code) => {
    if (code) {
      for (const other of children) if (other !== child) other.kill('SIGTERM');
      process.exitCode = code;
    }
  });
