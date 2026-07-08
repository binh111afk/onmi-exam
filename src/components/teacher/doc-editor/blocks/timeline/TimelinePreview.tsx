import React from 'react';
import { Calendar, Clock, Star, Award, Flag, BookOpen, Briefcase, GraduationCap, Heart, Activity, MapPin, User } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { createNewTimelineContent } from './TimelineUtils';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Clock, Calendar, Star, Award, Flag, BookOpen, Briefcase, GraduationCap, Heart, Activity, MapPin, User
};

interface TimelinePreviewProps {
  block: DocBlock;
  indentClassName?: string;
}

export const TimelinePreview: React.FC<TimelinePreviewProps> = ({
  block,
  indentClassName = '',
}) => {
  const content = block.timelineContent || createNewTimelineContent();
  const rawEvents = content.events || [];
  const events = content.settings.direction === 'reverse' ? [...rawEvents].reverse() : rawEvents;

  if (events.length === 0) {
    return (
      <div className={`p-6 border border-slate-100 bg-slate-50/50 rounded-xl text-center italic text-[10px] text-slate-400 select-none ${indentClassName}`}>
        Dòng thời gian chưa có mốc nào.
      </div>
    );
  }

  const renderIcon = (iconName?: string, color?: string) => {
    const IconComp = iconMap[iconName || 'Clock'] || Clock;
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 border-2 border-white"
        style={{ backgroundColor: color || '#6366f1' }}
      >
        <IconComp size={14} />
      </div>
    );
  };

  if (content.settings.layout === 'horizontal') {
    return (
      <div className={`my-4 w-full overflow-x-auto py-6 px-4 select-none ${indentClassName}`}>
        <div className="flex items-start gap-8 min-w-max relative pb-4">
          <div className="absolute top-10 left-4 right-4 h-0.5 bg-slate-200" />

          {events.map((event) => (
            <div key={event.id} className="w-56 flex flex-col items-center relative animate-fadeIn">
              <div className="text-[9px] font-black text-slate-400 bg-slate-100/50 px-2 py-0.5 rounded-full mb-3 select-none">
                {event.date || 'Chưa đặt ngày'}
              </div>

              <div className="relative z-10 my-1">
                {renderIcon(event.icon, event.color)}
              </div>

              <div className="mt-3 w-full bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs flex flex-col gap-1 hover:shadow-xs transition duration-200">
                <h4 className="text-[11px] font-bold text-slate-800" style={{ color: event.color }}>
                  {event.title || 'Mốc thời gian mới'}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">
                  {event.description || 'Không có mô tả cho mốc này.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`my-6 relative pl-6 pr-2 select-none ${indentClassName}`}>
      <div className="absolute top-2 bottom-2 left-9 w-0.5 bg-slate-200" />

      <div className="flex flex-col gap-6">
        {events.map((event) => (
          <div key={event.id} className="flex gap-4 items-start relative animate-fadeIn">
            <div className="relative z-10">
              {renderIcon(event.icon, event.color)}
            </div>

            <div className="flex-1 bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs flex flex-col gap-1.5 hover:shadow-xs transition duration-200">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-[11px] font-black text-slate-800" style={{ color: event.color }}>
                  {event.title || 'Mốc thời gian mới'}
                </h4>
                <span className="text-[9px] font-black text-slate-400 bg-slate-100/50 px-2 py-0.5 rounded-full shrink-0">
                  {event.date || 'Chưa đặt ngày'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed whitespace-pre-wrap">
                {event.description || 'Không có mô tả cho mốc này.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
