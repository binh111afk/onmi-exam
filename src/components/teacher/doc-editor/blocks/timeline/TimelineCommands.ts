import type { TimelineSettings } from './TimelineTypes';

export type TimelineCommand =
  | { type: 'add-event' }
  | { type: 'update-settings'; settings: Partial<TimelineSettings> };
