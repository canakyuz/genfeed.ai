import { isGoogleAuthAvailable } from '@genfeedai/auth-client';
import { useSyncExternalStore } from 'react';

function subscribe(): () => void {
  return () => undefined;
}

/** Keep Google hidden during SSR until the browser reads the runtime capability. */
export function useIsGoogleAuthAvailable(): boolean {
  return useSyncExternalStore(subscribe, isGoogleAuthAvailable, () => false);
}
