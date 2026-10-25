import { readBetterAuthEnabledFromEnv } from '@genfeedai/auth-client/server';
import { connection } from 'next/server';
import { readGoogleAuthAvailableFromEnv } from '@/lib/runtime-config/google-auth-availability';
import { readMagicLinkAvailableFromEnv } from '@/lib/runtime-config/magic-link-availability';
import { createRuntimeAuthConfigSource } from '@/lib/runtime-config/runtime-config-source';

export async function GET(): Promise<Response> {
  await connection();

  const source = createRuntimeAuthConfigSource(
    readBetterAuthEnabledFromEnv(),
    readMagicLinkAvailableFromEnv(),
    readGoogleAuthAvailableFromEnv(),
  );

  return new Response(source, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/javascript; charset=utf-8',
    },
  });
}
