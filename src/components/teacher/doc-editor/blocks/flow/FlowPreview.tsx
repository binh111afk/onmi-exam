import React from 'react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { createNewFlowContent } from './FlowUtils';

interface FlowPreviewProps {
  block: DocBlock;
  indentClassName?: string;
}

export const FlowPreview: React.FC<FlowPreviewProps> = ({
  block,
  indentClassName = '',
}) => {
  const content = block.flowContent || createNewFlowContent();
  const steps = content.steps || [];
  const settings = content.settings;

  if (steps.length === 0) {
    return (
      <div className={`p-6 border border-slate-100 bg-slate-50/50 rounded-xl text-center italic text-[10px] text-slate-400 select-none ${indentClassName}`}>
        Quy trình chưa có bước nào.
      </div>
    );
  }

  const themeColor = settings.themeColor || '#6366f1';

  const getStepLabel = (index: number) => {
    const numbering = settings.stepNumbering || 'numbers';
    if (numbering === 'none') return '';
    if (numbering === 'roman') {
      const romanSymbols = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      return `Bước ${romanSymbols[index] || index + 1}`;
    }
    if (numbering === 'alphabet') {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return `Bước ${alphabet[index] || index + 1}`;
    }
    return `Bước ${index + 1}`;
  };

  const cardStyleClass = {
    bordered: 'bg-white border border-slate-200',
    flat: 'bg-slate-50/60 border border-transparent shadow-none',
    shadow: 'bg-white border border-slate-100 shadow-md'
  }[settings.cardStyle || 'bordered'] || 'bg-white border border-slate-200';

  const horizontalSpacingClass = {
    compact: 'gap-x-3 gap-y-4',
    normal: 'gap-x-5 gap-y-6',
    wide: 'gap-x-8 gap-y-10'
  }[settings.stepSpacing || 'normal'] || 'gap-x-5 gap-y-6';

  const verticalSpacingClass = {
    compact: 'gap-3',
    normal: 'gap-5',
    wide: 'gap-8'
  }[settings.stepSpacing || 'normal'] || 'gap-5';

  const renderArrow = (direction: 'right' | 'down', style: 'straight' | 'dashed' | 'curved') => {
    const isDashed = settings.connectorStyle === 'dashed' ? '4,4' : (settings.connectorStyle === 'dotted' ? '2,2' : undefined);
    const strokeColor = themeColor;
    
    if (direction === 'right') {
      return (
        <svg className="w-5 h-5 overflow-visible" style={{ color: strokeColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeDasharray={isDashed}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={style === 'curved' ? "M 2,12 C 10,6 14,18 22,12" : "M 2,12 H 22"}
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M 16,7 L 22,12 L 16,17" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 overflow-visible" style={{ color: strokeColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeDasharray={isDashed}
            strokeLinecap="round"
            strokeLinejoin="round"
            d={style === 'curved' ? "M 12,2 C 6,10 18,14 12,22" : "M 12,2 V 22"}
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M 7,16 L 12,22 L 17,16" />
        </svg>
      );
    }
  };

  if (settings.layout === 'horizontal') {
    return (
      <div className={`my-4 flex flex-wrap items-center justify-center select-none ${indentClassName} ${horizontalSpacingClass}`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`w-48 rounded-2xl p-4 shadow-3xs hover:shadow-xs transition flex flex-col gap-1 text-center items-center relative animate-fadeIn ${cardStyleClass}`}>
              {settings.stepNumbering !== 'none' && (
                <span className="text-[8px] font-black text-white px-2 py-0.5 rounded-full select-none animate-fadeIn" style={{ backgroundColor: step.color || themeColor }}>
                  {getStepLabel(index)}
                </span>
              )}
              <h4 className="text-[10px] font-bold text-[#1E293B] mt-1.5">{step.title || 'Bước mới'}</h4>
              <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-0.5">{step.description || 'Không có mô tả cho bước này.'}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex items-center justify-center select-none">
                {renderArrow('right', settings.arrowStyle || 'straight')}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (settings.layout === 'vertical') {
    return (
      <div className={`my-4 flex flex-col items-center select-none ${indentClassName} ${verticalSpacingClass}`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`w-64 rounded-2xl p-4 shadow-3xs hover:shadow-xs transition flex flex-col gap-1 text-center items-center animate-fadeIn ${cardStyleClass}`}>
              {settings.stepNumbering !== 'none' && (
                <span className="text-[8px] font-black text-white px-2 py-0.5 rounded-full animate-fadeIn" style={{ backgroundColor: step.color || themeColor }}>
                  {getStepLabel(index)}
                </span>
              )}
              <h4 className="text-[10px] font-bold text-[#1E293B] mt-1.5">{step.title || 'Bước mới'}</h4>
              <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-0.5">{step.description || 'Không có mô tả cho bước này.'}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="select-none my-1">
                {renderArrow('down', settings.arrowStyle || 'straight')}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // default/fallback or 'zigzag'
  return (
    <div className={`my-4 flex flex-wrap items-center justify-center select-none ${indentClassName} ${horizontalSpacingClass}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4 animate-fadeIn">
          <div className={`w-44 rounded-2xl p-4 shadow-3xs hover:shadow-xs transition flex flex-col gap-1 text-center items-center ${cardStyleClass}`}>
            {settings.stepNumbering !== 'none' && (
              <span className="text-[8px] font-black text-white px-2 py-0.5 rounded-full animate-fadeIn" style={{ backgroundColor: step.color || themeColor }}>
                {getStepLabel(index)}
              </span>
            )}
            <h4 className="text-[10px] font-bold text-[#1E293B] mt-1.5">{step.title || 'Bước mới'}</h4>
            <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-0.5">{step.description || 'Không có mô tả cho bước này.'}</p>
          </div>
          {index < steps.length - 1 && (
            <div>
              {renderArrow(index % 2 === 0 ? 'right' : 'down', settings.arrowStyle || 'straight')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
