export function createRuntimeAuthConfigSource(
  isEnabled: boolean,
  isMagicLinkAvailable = true,
  isGoogleAuthAvailable = false,
): string {
  const config = {
    betterAuthEnabled: isEnabled,
    isGoogleAuthAvailable,
    isMagicLinkAvailable,
  };
  return `globalThis.__GENFEED_RUNTIME_CONFIG__={...globalThis.__GENFEED_RUNTIME_CONFIG__,...${JSON.stringify(config).replaceAll('<', '\\u003c')}};`;
}
