import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { TimelineEvent, TimelineContent, TimelineSettings } from '../TimelineTypes';
import { createDefaultEvent, createNewTimelineContent } from '../TimelineUtils';

export function useTimeline(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const timelineContent: TimelineContent = block.timelineContent || createNewTimelineContent();
  const events = timelineContent.events;

  const updateTimelineContent = useCallback((nextContent: TimelineContent) => {
    onUpdateBlock(idx, {
      ...block,
      timelineContent: nextContent,
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateEvents = useCallback((nextEvents: TimelineEvent[]) => {
    updateTimelineContent({
      ...timelineContent,
      events: nextEvents,
    });
  }, [timelineContent, updateTimelineContent]);

  const updateSettings = useCallback((nextSettings: Partial<TimelineSettings>) => {
    updateTimelineContent({
      ...timelineContent,
      settings: {
        ...timelineContent.settings,
        ...nextSettings,
      },
    });
  }, [timelineContent, updateTimelineContent]);

  const addEvent = useCallback(() => {
    updateEvents([...events, createDefaultEvent(crypto.randomUUID())]);
  }, [events, updateEvents]);

  const deleteEvent = useCallback((eventId: string) => {
    updateEvents(events.filter(e => e.id !== eventId));
  }, [events, updateEvents]);

  const duplicateEvent = useCallback((eventId: string) => {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const duplicated: TimelineEvent = {
      ...events[eventIndex],
      id: crypto.randomUUID(),
    };
    const next = [...events];
    next.splice(eventIndex + 1, 0, duplicated);
    updateEvents(next);
  }, [events, updateEvents]);

  const moveEvent = useCallback((eventId: string, direction: 'up' | 'down') => {
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;
    const targetIndex = direction === 'up' ? eventIndex - 1 : eventIndex + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const next = [...events];
    [next[eventIndex], next[targetIndex]] = [next[targetIndex], next[eventIndex]];
    updateEvents(next);
  }, [events, updateEvents]);

  const updateEvent = useCallback((eventId: string, updated: TimelineEvent) => {
    updateEvents(events.map(e => e.id === eventId ? updated : e));
  }, [events, updateEvents]);

  return {
    events,
    settings: timelineContent.settings,
    addEvent,
    deleteEvent,
    duplicateEvent,
    moveEvent,
    updateEvent,
    updateSettings,
  };
}
