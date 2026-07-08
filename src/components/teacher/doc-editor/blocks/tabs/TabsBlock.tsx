import React, { useState, useEffect } from 'react';
import { Layers, Trash2, Copy, ArrowLeft, ArrowRight } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { BlockHeader } from '../common/BlockHeader';
import { BlockEmptyState } from '../common/BlockEmptyState';
import { EditableText } from '../common/EditableText';
import { TabsToolbar } from './TabsToolbar';
import { TabsSettings } from './TabsSettings';
import { useTabs } from './hooks/useTabs';
import { createNewTabsContent } from './TabsUtils';

interface TabsBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
  showUniversalToolbar?: boolean;
}

export const TabsBlockComponent: React.FC<TabsBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    tabs,
    settings,
    addTab,
    deleteTab,
    duplicateTab,
    moveTab,
    updateTab,
    updateSettings,
  } = useTabs(block, idx, onUpdateBlock);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    if (!block.tabsContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        tabsContent: createNewTabsContent(),
      });
    }
  }, [block, idx, isActive, onUpdateBlock]);

  useEffect(() => {
    if (tabs.length > 0 && (!activeTabId || !tabs.some(t => t.id === activeTabId))) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const activeIndex = tabs.findIndex(t => t.id === (activeTabId || ''));
  const themeColor = settings.themeColor || '#6366f1';

  return (
    <div
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-indigo-100 bg-indigo-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <BlockHeader icon={<Layers size={10} className="stroke-[2.5]" />} label="Thẻ nội dung (Tabs)" />

      <TabsToolbar
        isBlockActive={isActive}
        settings={settings}
        onAddTab={addTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-col gap-3 mt-1 w-full bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-2xs">
        {tabs.length === 0 ? (
          <div className="p-3">
            <BlockEmptyState
              text="Chưa có tab nào."
              actionLabel="Thêm tab"
              onAction={addTab}
              icon={<Layers size={20} />}
            />
          </div>
        ) : (
          <div className="flex flex-col w-full animate-fadeIn">
            {/* Headers row with tab switcher */}
            <div className="flex border-b border-slate-150 bg-slate-50/40 overflow-x-auto scrollbar-none select-none">
              {tabs.map((tab) => {
                const isSelected = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    style={{
                      borderBottomColor: isSelected ? themeColor : 'transparent',
                      color: isSelected ? themeColor : undefined,
                    }}
                    className="px-4 py-2.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer border-b-2 whitespace-nowrap"
                  >
                    {tab.title || 'Tab mới'}
                  </button>
                );
              })}
            </div>

            {/* Editing Pane for active tab */}
            {activeTab && (
              <div key={activeTab.id} className="p-4 flex flex-col gap-3.5 animate-fadeIn">
                <div className="flex items-center justify-between gap-3 select-none">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Hiệu chỉnh tab {activeIndex + 1}
                  </div>

                  {/* Actions for current tab */}
                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition duration-150">
                    <button
                      onClick={() => moveTab(activeTab.id, 'up')}
                      disabled={activeIndex === 0}
                      className="p-1 hover:bg-slate-150 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Di chuyển sang trái"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      onClick={() => moveTab(activeTab.id, 'down')}
                      disabled={activeIndex === tabs.length - 1}
                      className="p-1 hover:bg-slate-150 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Di chuyển sang phải"
                    >
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => {
                        duplicateTab(activeTab.id);
                      }}
                      className="p-1 hover:bg-slate-150 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Nhân bản"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => {
                        const prevIdx = activeIndex > 0 ? activeIndex - 1 : 0;
                        deleteTab(activeTab.id);
                        if (tabs.length > 1) {
                          setActiveTabId(tabs[prevIdx]?.id || null);
                        }
                      }}
                      className="p-1 hover:bg-slate-150 rounded text-slate-500 hover:text-red-655 cursor-pointer"
                      title="Xóa tab"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider select-none">Tên tab</label>
                  <EditableText
                    mode="input"
                    value={activeTab.title}
                    onChange={(val) => updateTab(activeTab.id, { ...activeTab, title: val })}
                    placeholder="Nhập tiêu đề tab..."
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-black text-slate-800 outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider select-none">Nội dung</label>
                  <EditableText
                    mode="textarea"
                    rows={4}
                    value={activeTab.content}
                    onChange={(val) => updateTab(activeTab.id, { ...activeTab, content: val })}
                    placeholder="Nhập nội dung hiển thị trong tab này..."
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-150 focus:bg-white focus:border-primary rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-655 outline-none transition resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <TabsSettings
        isOpen={isSettingsOpen}
        settings={settings}
        tabs={tabs}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export const TabsBlock = React.memo(TabsBlockComponent);
