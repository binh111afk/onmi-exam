import React, { useState } from 'react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { createNewTabsContent } from './TabsUtils';

interface TabsPreviewProps {
  block: DocBlock;
  indentClassName?: string;
}

export const TabsPreview: React.FC<TabsPreviewProps> = ({
  block,
  indentClassName = '',
}) => {
  const content = block.tabsContent || createNewTabsContent();
  const tabs = content.tabs || [];
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  React.useEffect(() => {
    if (tabs.length > 0 && (!activeTabId || !tabs.some(t => t.id === activeTabId))) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  if (tabs.length === 0) {
    return (
      <div className={`p-6 border border-slate-100 bg-slate-50/50 rounded-xl text-center italic text-[10px] text-slate-400 select-none ${indentClassName}`}>
        Chưa có tab.
      </div>
    );
  }

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const themeColor = content.settings.themeColor || '#6366f1';

  return (
    <div className={`my-4 flex flex-col border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-3xs hover:shadow-2xs transition ${indentClassName}`}>
      <div className="flex border-b border-slate-150 bg-slate-50/40 overflow-x-auto scrollbar-none select-none">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                borderBottomColor: isActive ? themeColor : 'transparent',
                color: isActive ? themeColor : undefined,
              }}
              className="px-4 py-3 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer border-b-2 whitespace-nowrap"
            >
              {tab.title || 'Tab mới'}
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div key={activeTab.id} className="p-4.5 min-h-[80px] animate-fadeIn select-text">
          <p className="text-[10px] font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
            {activeTab.content || 'Nội dung tab trống.'}
          </p>
        </div>
      )}
    </div>
  );
};
