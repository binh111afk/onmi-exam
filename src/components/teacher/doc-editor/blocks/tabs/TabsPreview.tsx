import React, { useState } from 'react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { createNewTabsContent } from './TabsUtils';
import { LatexText } from '../common/LatexText';

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
  const settings = content.settings;

  const defaultTab = settings.defaultActiveTab;
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  React.useEffect(() => {
    if (tabs.length > 0) {
      if (defaultTab && tabs.some(t => t.id === defaultTab)) {
        setActiveTabId(defaultTab);
      } else if (!activeTabId || !tabs.some(t => t.id === activeTabId)) {
        setActiveTabId(tabs[0].id);
      }
    }
  }, [tabs, defaultTab, activeTabId]);

  if (tabs.length === 0) {
    return (
      <div className={`p-6 border border-slate-100 bg-slate-50/50 rounded-xl text-center italic text-[10px] text-slate-400 select-none ${indentClassName}`}>
        Chưa có tab.
      </div>
    );
  }

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const themeColor = settings.themeColor || '#6366f1';

  const isLeft = settings.position === 'left';
  const isBottom = settings.position === 'bottom';
  const containerRoundedClass = settings.roundedTabs !== false ? 'rounded-2xl' : 'rounded-none';
  const tabButtonRoundedClass = settings.roundedTabs !== false ? 'rounded-lg' : 'rounded-none';

  const tabWidthClass = settings.equalWidth ? 'flex-1 text-center justify-center' : '';
  const scrollClass = settings.scrollMode !== false ? 'overflow-x-auto scrollbar-none' : 'flex-wrap';

  // Render headers list
  const renderHeaders = () => (
    <div className={`flex border-slate-200 bg-slate-50/40 select-none ${scrollClass} ${
      isLeft ? 'flex-col border-r w-32 shrink-0' : (isBottom ? 'border-t' : 'border-b')
    }`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        
        // Dynamic styles based on tabStyle
        let styleObj: React.CSSProperties = {};
        let styleClasses = 'px-4 py-3 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer whitespace-nowrap flex items-center';

        if (settings.tabStyle === 'pills') {
          styleClasses += ` m-1.5 px-3.5 py-1.5 ${tabButtonRoundedClass}`;
          styleObj = {
            backgroundColor: isActive ? themeColor : 'transparent',
            color: isActive ? '#fff' : undefined,
          };
        } else if (settings.tabStyle === 'blocks') {
          styleClasses += ' border-r border-slate-200 last:border-0';
          styleObj = {
            backgroundColor: isActive ? '#fff' : 'transparent',
            borderTop: isActive && !isBottom && !isLeft ? `2px solid ${themeColor}` : undefined,
            borderBottom: isActive && isBottom ? `2px solid ${themeColor}` : undefined,
            borderLeft: isActive && isLeft ? `2px solid ${themeColor}` : undefined,
            color: isActive ? themeColor : undefined,
          };
        } else {
          // Default: underline
          styleClasses += ` border-b-2`;
          styleObj = {
            borderBottomColor: isActive ? themeColor : 'transparent',
            color: isActive ? themeColor : undefined,
          };
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={styleObj}
            className={`${styleClasses} ${tabWidthClass}`}
          >
            <LatexText value={tab.title || 'Tab mới'} />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`my-4 flex border border-slate-200 overflow-hidden bg-white shadow-3xs hover:shadow-2xs transition ${
      isLeft ? 'flex-row' : (isBottom ? 'flex-col-reverse' : 'flex-col')
    } ${containerRoundedClass} ${indentClassName}`}>
      {renderHeaders()}

      {activeTab && (
        <div key={activeTab.id} className="p-4.5 min-h-[80px] animate-fadeIn select-text flex-1">
          <div className="text-[10px] font-semibold text-slate-655 leading-relaxed whitespace-pre-wrap">
            <LatexText value={activeTab.content || 'Nội dung tab trống.'} />
          </div>
        </div>
      )}
    </div>
  );
};
