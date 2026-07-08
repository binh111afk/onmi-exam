import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Copy, ArrowUp, ArrowDown, Calendar, Star, Award, Flag, BookOpen, Briefcase, GraduationCap, Heart, Activity, MapPin, User } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { BlockEmptyState } from '../common/BlockEmptyState';
import { EditableText } from '../common/EditableText';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineSettings } from './TimelineSettings';
import { useTimeline } from './hooks/useTimeline';
import { createNewTimelineContent } from './TimelineUtils';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Clock, Calendar, Star, Award, Flag, BookOpen, Briefcase, GraduationCap, Heart, Activity, MapPin, User
};

const TIMELINE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b'];
const TIMELINE_ICONS = ['Clock', 'Calendar', 'Star', 'Award', 'Flag', 'BookOpen', 'Briefcase', 'GraduationCap', 'Heart', 'Activity', 'MapPin', 'User'];

interface TimelineBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  showUniversalToolbar?: boolean;
}

export const TimelineBlockComponent: React.FC<TimelineBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    events,
    settings,
    addEvent,
    deleteEvent,
    duplicateEvent,
    moveEvent,
    updateEvent,
    updateSettings,
  } = useTimeline(block, idx, onUpdateBlock);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeColorPickerId, setActiveColorPickerId] = useState<string | null>(null);
  const [activeIconPickerId, setActiveIconPickerId] = useState<string | null>(null);

  useEffect(() => {
    if (!block.timelineContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        timelineContent: createNewTimelineContent(),
      });
    }
  }, [block, idx, isActive, onUpdateBlock]);

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<Clock size={10} className="stroke-[2.5]" />} label="Dòng thời gian" />

      <TimelineToolbar
        isBlockActive={isActive}
        settings={settings}
        onAddEvent={addEvent}
        onUpdateSettings={updateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-col gap-3 mt-1 w-full">
        {events.length === 0 ? (
          <BlockEmptyState
            text="Dòng thời gian chưa có mốc nào."
            actionLabel="Thêm mốc"
            onAction={addEvent}
            icon={<Clock size={20} />}
          />
        ) : (
          events.map((event, index) => {
            const IconComp = iconMap[event.icon || 'Clock'] || Clock;
            return (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-slate-150 p-3.5 shadow-2xs hover:shadow-sm transition flex flex-col gap-3 group relative"
              >
                {/* Header row of milestone card */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Icon Picker Toggle */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setActiveIconPickerId(activeIconPickerId === event.id ? null : event.id);
                          setActiveColorPickerId(null);
                        }}
                        style={{ color: event.color }}
                        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition cursor-pointer"
                        title="Chọn biểu tượng"
                      >
                        <IconComp size={14} />
                      </button>

                      {activeIconPickerId === event.id && (
                        <div className="absolute top-8 left-0 z-20 bg-white border border-slate-150 rounded-xl p-2 shadow-lg grid grid-cols-4 gap-1.5 min-w-[130px] animate-fadeIn">
                          {TIMELINE_ICONS.map((ic) => {
                            const Comp = iconMap[ic];
                            return (
                              <button
                                key={ic}
                                onClick={() => {
                                  updateEvent(event.id, { ...event, icon: ic });
                                  setActiveIconPickerId(null);
                                }}
                                className="w-6 h-6 hover:bg-slate-100 rounded-md flex items-center justify-center text-slate-500 cursor-pointer"
                              >
                                <Comp size={12} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Color Picker Toggle */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setActiveColorPickerId(activeColorPickerId === event.id ? null : event.id);
                          setActiveIconPickerId(null);
                        }}
                        style={{ backgroundColor: event.color }}
                        className="w-4 h-4 rounded-full border border-white shadow-2xs cursor-pointer hover:scale-110 transition"
                        title="Chọn màu"
                      />

                      {activeColorPickerId === event.id && (
                        <div className="absolute top-6 left-0 z-20 bg-white border border-slate-150 rounded-xl p-1.5 shadow-lg flex gap-1 animate-fadeIn">
                          {TIMELINE_COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => {
                                updateEvent(event.id, { ...event, color: c });
                                setActiveColorPickerId(null);
                              }}
                              style={{ backgroundColor: c }}
                              className="w-4.5 h-4.5 rounded-full border border-white shadow-3xs cursor-pointer hover:scale-110 transition"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition duration-150">
                    <button
                      onClick={() => moveEvent(event.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => moveEvent(event.id, 'down')}
                      disabled={index === events.length - 1}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={() => duplicateEvent(event.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Nhân bản"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-red-650 cursor-pointer"
                      title="Xóa mốc"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Edit Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <EditableText
                      mode="input"
                      value={event.date}
                      onChange={(val) => updateEvent(event.id, { ...event, date: val })}
                      placeholder="Ngày/Mốc thời gian"
                      className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-700 outline-none transition"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <EditableText
                      mode="input"
                      value={event.title}
                      onChange={(val) => updateEvent(event.id, { ...event, title: val })}
                      placeholder="Nhập tiêu đề mốc..."
                      className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-black text-slate-800 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <EditableText
                    mode="textarea"
                    rows={2}
                    value={event.description}
                    onChange={(val) => updateEvent(event.id, { ...event, description: val })}
                    placeholder="Mô tả mốc thời gian..."
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-650 outline-none transition resize-none leading-relaxed"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <TimelineSettings
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export const TimelineBlock = React.memo(TimelineBlockComponent);
