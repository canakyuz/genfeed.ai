import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '../../../../../../../..',
);
export const outputDirectory = resolve(
  tmpdir(),
  `genfeed-onboarding-${createHash('sha256').update(root).digest('hex').slice(0, 12)}`,
);
