import { afterEach, describe, expect, it, vi } from 'vitest';
import { readGoogleAuthAvailableFromEnv } from './google-auth-availability';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each(['0', '1'])('Google auth availability (cloud=%s)', (cloud) => {
  it.each([
    { clientId: undefined, clientSecret: undefined, expected: false },
    { clientId: 'test-client-id', clientSecret: undefined, expected: false },
    {
      clientId: undefined,
      clientSecret: 'test-client-secret',
      expected: false,
    },
    { clientId: ' ', clientSecret: 'test-client-secret', expected: false },
    { clientId: 'test-client-id', clientSecret: ' \t', expected: false },
    { clientId: '', clientSecret: '', expected: false },
    {
      clientId: ' test-client-id ',
      clientSecret: ' test-client-secret ',
      expected: true,
    },
  ])(
    'requires both trimmed credentials: $clientId / $clientSecret',
    ({ clientId, clientSecret, expected }) => {
      vi.stubEnv('GENFEED_CLOUD', cloud);
      vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', clientId);
      vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', clientSecret);

      expect(readGoogleAuthAvailableFromEnv()).toBe(expected);
    },
  );

  it('reads changed runtime credentials without rebuilding', () => {
    vi.stubEnv('GENFEED_CLOUD', cloud);
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'test-client-id');
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', undefined);
    expect(readGoogleAuthAvailableFromEnv()).toBe(false);

    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'test-client-secret');
    expect(readGoogleAuthAvailableFromEnv()).toBe(true);

    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', ' ');
    expect(readGoogleAuthAvailableFromEnv()).toBe(false);
  });
});
