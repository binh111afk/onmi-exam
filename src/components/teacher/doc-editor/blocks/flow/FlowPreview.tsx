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

  if (steps.length === 0) {
    return (
      <div className={`p-6 border border-slate-100 bg-slate-50/50 rounded-xl text-center italic text-[10px] text-slate-400 select-none ${indentClassName}`}>
        Quy trình chưa có bước nào.
      </div>
    );
  }

  const renderArrow = (direction: 'right' | 'down', style: 'straight' | 'dashed' | 'curved') => {
    const isDashed = style === 'dashed' ? '3,3' : undefined;
    if (direction === 'right') {
      return (
        <svg className="w-5 h-5 overflow-visible text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <svg className="w-5 h-5 overflow-visible text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

  if (content.settings.layout === 'horizontal') {
    return (
      <div className={`my-4 flex flex-wrap items-center justify-center gap-y-6 gap-x-4 select-none ${indentClassName}`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="w-48 bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs hover:shadow-xs transition flex flex-col gap-1 text-center items-center relative animate-fadeIn">
              <span className="text-[8px] font-black text-white px-2 py-0.5 rounded-full select-none" style={{ backgroundColor: step.color }}>
                Bước {index + 1}
              </span>
              <h4 className="text-[10px] font-bold text-[#1E293B] mt-1.5">{step.title}</h4>
              <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-0.5">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex items-center justify-center select-none">
                {renderArrow('right', content.settings.arrowStyle)}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (content.settings.layout === 'vertical') {
    return (
      <div className={`my-4 flex flex-col items-center gap-4 select-none ${indentClassName}`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="w-64 bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs hover:shadow-xs transition flex flex-col gap-1 text-center items-center animate-fadeIn">
              <span className="text-[8px] font-black text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: step.color }}>
                Bước {index + 1}
              </span>
              <h4 className="text-[10px] font-bold text-[#1E293B] mt-1.5">{step.title}</h4>
              <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-0.5">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="select-none my-1">
                {renderArrow('down', content.settings.arrowStyle)}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={`my-4 flex flex-wrap items-center justify-center gap-6 select-none ${indentClassName}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-4 animate-fadeIn">
          <div className="w-44 bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs hover:shadow-xs transition flex flex-col gap-1 text-center items-center">
            <span className="text-[8px] font-black text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: step.color }}>
              Bước {index + 1}
            </span>
            <h4 className="text-[10px] font-bold text-[#1E293B] mt-1.5">{step.title}</h4>
            <p className="text-[9px] text-slate-500 font-medium leading-relaxed mt-0.5">{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div>
              {renderArrow('right', content.settings.arrowStyle)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
