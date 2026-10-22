import type { PluginAppEntry } from './organization-plugins-page.props';
export interface PluginsGalleryPrototypeProps {
  apps: PluginAppEntry[];
  isLoading: boolean;
}
export interface PrototypeAppProps {
  app: PluginAppEntry;
  onAction: (app: PluginAppEntry) => void;
  onDetails: (app: PluginAppEntry) => void;
  onPreference: (app: PluginAppEntry, action: 'pin' | 'remove') => void;
}
