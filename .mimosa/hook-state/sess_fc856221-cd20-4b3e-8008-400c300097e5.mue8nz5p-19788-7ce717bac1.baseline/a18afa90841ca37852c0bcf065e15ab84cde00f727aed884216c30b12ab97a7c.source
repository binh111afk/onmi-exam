import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { TabItem, TabsContent, TabsSettings } from '../TabsTypes';
import { createDefaultTab, createNewTabsContent } from '../TabsUtils';

export function useTabs(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const tabsContent: TabsContent = block.tabsContent || createNewTabsContent();
  const tabs = tabsContent.tabs;

  const updateTabsContent = useCallback((nextContent: TabsContent) => {
    onUpdateBlock(idx, {
      ...block,
      tabsContent: nextContent,
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateTabs = useCallback((nextTabs: TabItem[]) => {
    updateTabsContent({
      ...tabsContent,
      tabs: nextTabs,
    });
  }, [tabsContent, updateTabsContent]);

  const updateSettings = useCallback((nextSettings: Partial<TabsSettings>) => {
    updateTabsContent({
      ...tabsContent,
      settings: {
        ...tabsContent.settings,
        ...nextSettings,
      },
    });
  }, [tabsContent, updateTabsContent]);

  const addTab = useCallback(() => {
    updateTabs([...tabs, createDefaultTab(crypto.randomUUID())]);
  }, [tabs, updateTabs]);

  const deleteTab = useCallback((tabId: string) => {
    updateTabs(tabs.filter(t => t.id !== tabId));
  }, [tabs, updateTabs]);

  const duplicateTab = useCallback((tabId: string) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const duplicated: TabItem = {
      ...tabs[tabIndex],
      id: crypto.randomUUID(),
    };
    const next = [...tabs];
    next.splice(tabIndex + 1, 0, duplicated);
    updateTabs(next);
  }, [tabs, updateTabs]);

  const moveTab = useCallback((tabId: string, direction: 'up' | 'down') => {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    const targetIndex = direction === 'up' ? tabIndex - 1 : tabIndex + 1;
    if (targetIndex < 0 || targetIndex >= tabs.length) return;

    const next = [...tabs];
    [next[tabIndex], next[targetIndex]] = [next[targetIndex], next[tabIndex]];
    updateTabs(next);
  }, [tabs, updateTabs]);

  const updateTab = useCallback((tabId: string, updated: TabItem) => {
    updateTabs(tabs.map(t => t.id === tabId ? updated : t));
  }, [tabs, updateTabs]);

  return {
    tabs,
    settings: tabsContent.settings,
    addTab,
    deleteTab,
    duplicateTab,
    moveTab,
    updateTab,
    updateSettings,
  };
}
