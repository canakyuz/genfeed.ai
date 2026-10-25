/** Google is registered by the API only when both OAuth credentials exist. */
export function readGoogleAuthAvailableFromEnv(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim(),
  );
}
