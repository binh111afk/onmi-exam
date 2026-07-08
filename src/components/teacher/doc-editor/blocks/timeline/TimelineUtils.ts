import type { TimelineContent } from './TimelineTypes';

export const createNewTimelineContent = (): TimelineContent => {
  return {
    version: 1,
    events: [],
    settings: {
      layout: 'vertical',
      direction: 'normal'
    }
  };
};

export const createDefaultEvent = (id: string) => ({
  id,
  title: '',
  description: '',
  date: '',
  color: '#6366f1',
  icon: 'Clock'
});
