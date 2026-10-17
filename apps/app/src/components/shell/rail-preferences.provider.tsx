'use client';

import { createContext, type ReactNode, use } from 'react';
import { useRailPreferences } from '@/components/shell/use-rail-preferences';

interface RailPreferencesContextValue {
  pinnedAppIds: readonly string[];
  railAppOrder: readonly string[];
  setRailAppOrder: (order: readonly string[]) => void;
  togglePin: (appId: string) => void;
}

const RailPreferencesContext = createContext<RailPreferencesContextValue>({
  pinnedAppIds: [],
  railAppOrder: [],
  setRailAppOrder: () => {},
  togglePin: () => {},
});

/**
 * The member's rail pins and order, shared by the rail and Explore so a change
 * made in either shows in the other without a reload.
 */
export function RailPreferencesProvider({ children }: { children: ReactNode }) {
  const value = useRailPreferences();

  return (
    <RailPreferencesContext value={value}>{children}</RailPreferencesContext>
  );
}

export function useRailPreferencesContext(): RailPreferencesContextValue {
  return use(RailPreferencesContext);
}
