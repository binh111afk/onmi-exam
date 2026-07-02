import React from 'react';
import { Laptop, Tablet as TabletIcon, Smartphone, RefreshCw } from 'lucide-react';

interface Ch2ListItem {
  id: number;
  label: string;
  color: string;
  icon: string;
}

interface DocPreviewSimulatorProps {
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  selectedPage: 'water' | 'macromolecules';
  ch1Title: string;
  ch1Text: string;
  ch1Callout: string;
  ch2Title: string;
  ch2Text: string;
  ch2List: Ch2ListItem[];
}

export const DocPreviewSimulator: React.FC<DocPreviewSimulatorProps> = ({
  viewport,
  setViewport,
  selectedPage,
  ch1Title,
  ch1Text,
  ch1Callout,
  ch2Title,
  ch2Text,
  ch2List,
}) => {
  return (
    <aside className="w-[460px] bg-[#F8FAFC] border-r border-slate-100 flex flex-col overflow-hidden shrink-0 transition-all duration-300">
      {/* Preview Simulator Header */}
      <div className="h-11 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-white">
        <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Preview (Giao diện học sinh)</span>
        
        {/* Responsive viewport selector */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button 
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'desktop' ? 'bg-slate-100 text-primary' : ''}`}
          >
            <Laptop size={12} />
          </button>
          <button 
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'tablet' ? 'bg-slate-100 text-primary' : ''}`}
          >
            <TabletIcon size={12} />
          </button>
          <button 
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 ${viewport === 'mobile' ? 'bg-slate-100 text-primary' : ''}`}
          >
            <Smartphone size={12} />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-0.5" />
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Preview Frame Container */}
      <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-slate-100/50">
        {/* Virtual Frame Simulator */}
        <div 
          className={`bg-white rounded-2xl shadow-lg border border-slate-200/50 p-5 font-sans h-fit transition-all duration-300 ${
            viewport === 'desktop' 
              ? 'w-full' 
              : viewport === 'tablet' 
                ? 'w-[390px]' 
                : 'w-[310px]'
          }`}
        >
          {/* Header Tag inside simulator */}
          <div className="inline-block px-2.5 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded mb-4">
            Chương I
          </div>
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wide border-b border-slate-100 pb-2 mb-3">
            Thành phần hóa học của tế bào
          </h3>

          {/* Simulated live page text */}
          <div className="space-y-4 text-[10px] leading-relaxed text-[#475569]">
            {selectedPage === 'water' ? (
              <>
                <h4 className="text-[11px] font-black text-primary leading-tight">
                  {ch1Title}
                </h4>
                <p className="text-text-secondary leading-relaxed font-bold">
                  {ch1Text}
                </p>
                
                {/* Callout box inside simulator */}
                <div className="p-3 border border-indigo-100/50 bg-[#F5F3FF]/70 rounded-xl flex gap-2.5 items-center">
                  <span className="text-xs">💧</span>
                  <div className="flex-1 leading-normal text-text-secondary font-black">
                    {ch1Callout}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h4 className="text-[11px] font-black text-primary leading-tight">
                  {ch2Title}
                </h4>
                <p className="text-text-secondary leading-relaxed font-bold">
                  {ch2Text}
                </p>

                {/* List items inside simulator */}
                <div className="space-y-2">
                  {ch2List.map(item => (
                    <div key={item.id} className="p-2 border border-slate-100 rounded-xl flex gap-2 items-center bg-[#FAF9FF] shadow-sm">
                      <span className="text-xs shrink-0">{item.icon}</span>
                      <span className="text-[9px] font-black text-text-secondary leading-normal">{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
