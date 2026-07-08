import type { TabsSettings } from './TabsTypes';

export type TabsCommand =
  | { type: 'add-tab' }
  | { type: 'update-settings'; settings: Partial<TabsSettings> };
