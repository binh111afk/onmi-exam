import React from 'react';
import { Calendar, Clock, Star, Award, Flag, BookOpen, Briefcase, GraduationCap, Heart, Activity, MapPin, User } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { createNewTimelineContent } from './TimelineUtils';
import { LatexText } from '../common/LatexText';

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
  const settings = content.settings;
  const events = settings.direction === 'reverse' ? [...rawEvents].reverse() : rawEvents;

  if (events.length === 0) {
    return (
      <div className={`p-6 border border-slate-100 bg-slate-50/50 rounded-xl text-center italic text-[10px] text-slate-400 select-none ${indentClassName}`}>
        Dòng thời gian chưa có mốc nào.
      </div>
    );
  }

  const nodeRadiusClass = {
    circle: 'rounded-full',
    square: 'rounded-lg',
    pill: 'rounded-[12px]'
  }[settings.nodeStyle || 'circle'] || 'rounded-full';

  const verticalConnectorClass = {
    solid: 'border-l border-solid border-slate-200',
    dashed: 'border-l border-dashed border-slate-200',
    dotted: 'border-l border-dotted border-slate-200'
  }[settings.connectorStyle || 'solid'] || 'border-l border-solid border-slate-200';

  const horizontalConnectorClass = {
    solid: 'border-t border-solid border-slate-200',
    dashed: 'border-t border-dashed border-slate-200',
    dotted: 'border-t border-dotted border-slate-200'
  }[settings.connectorStyle || 'solid'] || 'border-t border-solid border-slate-200';

  const verticalSpacingClass = {
    compact: 'gap-4',
    cozy: 'gap-6',
    comfortable: 'gap-8'
  }[settings.spacing || 'cozy'] || 'gap-6';

  const horizontalSpacingClass = {
    compact: 'gap-4',
    cozy: 'gap-8',
    comfortable: 'gap-12'
  }[settings.spacing || 'cozy'] || 'gap-8';

  const cardPadding = settings.compactMode ? 'p-3' : 'p-4';
  const headingTextSize = settings.compactMode ? 'text-[10px]' : 'text-[11px]';
  const descTextSize = settings.compactMode ? 'text-[9px]' : 'text-[10px]';

  const renderIcon = (iconName?: string, color?: string) => {
    const IconComp = iconMap[iconName || 'Clock'] || Clock;
    return (
      <div
        className={`w-8 h-8 flex items-center justify-center text-white shadow-sm shrink-0 border-2 border-white ${nodeRadiusClass}`}
        style={{ backgroundColor: color || '#6366f1' }}
      >
        <IconComp size={14} />
      </div>
    );
  };

  const renderDateBadge = (date?: string, color?: string, extraClassName = '') => {
    const badgeColor = color || '#6366f1';
    return (
      <span
        className={`text-[9px] font-black text-white px-2.5 py-1 rounded-full shadow-sm select-none tracking-wide uppercase ${extraClassName}`}
        style={{ backgroundColor: badgeColor }}
      >
        {date || 'Chưa đặt ngày'}
      </span>
    );
  };

  if (settings.layout === 'horizontal') {
    return (
      <div className={`my-4 w-full overflow-x-auto py-6 px-4 select-none ${indentClassName}`}>
        <div className={`flex items-start min-w-max relative pb-4 ${horizontalSpacingClass}`}>
          <div className={`absolute top-10 left-4 right-4 h-0 ${horizontalConnectorClass}`} />

          {events.map((event, idx) => (
            <div key={event.id} className="w-56 flex flex-col items-center relative animate-fadeIn">
              {settings.showDate !== false && (
                <div className="mb-3">
                  {renderDateBadge(event.date, event.color)}
                </div>
              )}

              <div className="relative z-10 my-1">
                {renderIcon(event.icon, event.color)}
              </div>

              <div className={`mt-3 w-full bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col gap-1 hover:shadow-xs transition duration-200 ${cardPadding}`}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`${headingTextSize} font-bold`} style={{ color: event.color }}>
                    <LatexText value={event.title || 'Mốc thời gian mới'} />
                  </h4>
                  {settings.showNumber !== false && (
                    <span className="text-[8px] font-black text-slate-350 select-none">
                      #{idx + 1}
                    </span>
                  )}
                </div>
                <p className={`${descTextSize} text-slate-500 font-medium leading-relaxed whitespace-pre-wrap`}>
                  <LatexText value={event.description || 'Không có mô tả cho mốc này.'} />
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
      <div className={`absolute top-2 bottom-2 left-9 w-0 ${verticalConnectorClass}`} />

      <div className={`flex flex-col ${verticalSpacingClass}`}>
        {events.map((event, idx) => (
          <div key={event.id} className="flex gap-4 items-start relative animate-fadeIn">
            <div className="relative z-10">
              {renderIcon(event.icon, event.color)}
            </div>

            <div className={`flex-1 bg-white border border-slate-200 rounded-2xl shadow-3xs flex flex-col gap-1.5 hover:shadow-xs transition duration-200 ${cardPadding}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className={`${headingTextSize} font-black text-slate-800`} style={{ color: event.color }}>
                    <LatexText value={event.title || 'Mốc thời gian mới'} />
                  </h4>
                  {settings.showNumber !== false && (
                    <span className="text-[8px] font-black text-slate-350 select-none">
                      #{idx + 1}
                    </span>
                  )}
                </div>
                {settings.showDate !== false && renderDateBadge(event.date, event.color, 'shrink-0')}
              </div>
              <p className={`${descTextSize} text-slate-500 font-semibold leading-relaxed whitespace-pre-wrap`}>
                <LatexText value={event.description || 'Không có mô tả cho mốc này.'} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
