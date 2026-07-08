import type { FlowSettings } from './FlowTypes';

export type FlowCommand =
  | { type: 'add-step' }
  | { type: 'update-settings'; settings: Partial<FlowSettings> };
