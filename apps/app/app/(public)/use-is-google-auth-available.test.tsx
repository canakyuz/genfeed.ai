import { act, renderHook } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsGoogleAuthAvailable } from './use-is-google-auth-available';

function AvailabilityProbe() {
  return (
    <span>{useIsGoogleAuthAvailable() ? 'available' : 'unavailable'}</span>
  );
}

afterEach(() => {
  delete globalThis.__GENFEED_RUNTIME_CONFIG__;
});

describe('useIsGoogleAuthAvailable', () => {
  it('keeps Google unavailable before the server reports its capability', () => {
    const { result } = renderHook(() => useIsGoogleAuthAvailable());
    expect(result.current).toBe(false);
  });

  it.each([true, false])(
    'reads the browser runtime capability %s',
    (isGoogleAuthAvailable) => {
      globalThis.__GENFEED_RUNTIME_CONFIG__ = { isGoogleAuthAvailable };
      const { result } = renderHook(() => useIsGoogleAuthAvailable());
      expect(result.current).toBe(isGoogleAuthAvailable);
    },
  );

  it.each([true, false])(
    'uses a stable unavailable SSR snapshot when runtime capability is %s',
    (isGoogleAuthAvailable) => {
      globalThis.__GENFEED_RUNTIME_CONFIG__ = { isGoogleAuthAvailable };
      expect(renderToString(<AvailabilityProbe />)).toBe(
        '<span>unavailable</span>',
      );
    },
  );

  it.each([true, false])(
    'hydrates to runtime capability %s without a mismatch',
    async (isGoogleAuthAvailable) => {
      const container = document.createElement('div');
      container.innerHTML = renderToString(<AvailabilityProbe />);
      document.body.appendChild(container);
      globalThis.__GENFEED_RUNTIME_CONFIG__ = { isGoogleAuthAvailable };
      const onRecoverableError = vi.fn();
      let root: ReturnType<typeof hydrateRoot> | undefined;

      try {
        await act(async () => {
          root = hydrateRoot(container, <AvailabilityProbe />, {
            onRecoverableError,
          });
        });
        expect(container.textContent).toBe(
          isGoogleAuthAvailable ? 'available' : 'unavailable',
        );
        expect(onRecoverableError).not.toHaveBeenCalled();
      } finally {
        await act(async () => root?.unmount());
        container.remove();
      }
    },
  );
});
