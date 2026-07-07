import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DocBlock } from '../../../types/doc-editor';

export interface ActiveFormattingState {
  blockAlign: 'left' | 'center' | 'right' | 'justify';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string;
  highlight: string;
  fontSize: string;
  blockType: string;
  blockLevel?: 1 | 2 | 3;
}

interface FormattingStateContextType {
  formattingState: ActiveFormattingState;
  syncFormatting: () => void;
}

const FormattingStateContext = createContext<FormattingStateContextType | null>(null);

export const useFormattingState = () => {
  const context = useContext(FormattingStateContext);
  if (!context) throw new Error('useFormattingState must be used within a FormattingStateProvider');
  return context;
};

interface FormattingStateProviderProps {
  activeBlock: DocBlock;
  syncRef?: React.MutableRefObject<(() => void) | null>;
  children: React.ReactNode;
}

export const FormattingStateProvider: React.FC<FormattingStateProviderProps> = ({
  activeBlock,
  syncRef,
  children,
}) => {
  const [formattingState, setFormattingState] = useState<ActiveFormattingState>({
    blockAlign: 'left',
    textAlign: 'left',
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    color: '#1F2C3F',
    highlight: 'transparent',
    fontSize: '16',
    blockType: 'paragraph',
  });

  const rgbToHex = (colorVal: string): string => {
    if (!colorVal) return '#1F2C3F';
    const val = colorVal.trim().toLowerCase();
    if (val.startsWith('#')) return val.toUpperCase();
    if (val === 'transparent' || val === 'rgba(0, 0, 0, 0)' || val === 'rgba(0,0,0,0)') return 'transparent';
    
    const match = val.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    if (!match) return colorVal;
    
    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`.toUpperCase();
  };

  const syncFormatting = useCallback(() => {
    try {
      const selection = window.getSelection();
      let isInsideEditor = false;
      if (selection && selection.anchorNode) {
        let node: Node | null = selection.anchorNode;
        while (node && node !== document.body) {
          if (node instanceof HTMLElement && node.id && node.id.startsWith('block-editor-')) {
            isInsideEditor = true;
            break;
          }
          node = node.parentNode;
        }
      }

      const blockAlign = activeBlock?.align || 'left';
      const blockType = activeBlock?.type || 'paragraph';
      const blockLevel = activeBlock?.level;

      if (!isInsideEditor) {
        setFormattingState({
          blockAlign,
          textAlign: 'left',
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          color: '#1F2C3F',
          highlight: 'transparent',
          fontSize: '16',
          blockType,
          blockLevel,
        });
        return;
      }

      const bold = document.queryCommandState('bold');
      const italic = document.queryCommandState('italic');
      const underline = document.queryCommandState('underline');
      const strikethrough = document.queryCommandState('strikeThrough');

      let color = document.queryCommandValue('foreColor') || '#1F2C3F';
      let highlight = document.queryCommandValue('backColor') || 'transparent';
      color = rgbToHex(color);
      highlight = rgbToHex(highlight);

      let fontSize = '16';
      if (selection && selection.anchorNode) {
        let node: Node | null = selection.anchorNode;
        while (node && node !== document.body) {
          if (node instanceof HTMLElement) {
            const size = node.style.fontSize;
            if (size) {
              fontSize = size.replace('px', '');
              break;
            }
          }
          node = node.parentNode;
        }
      }

      let textAlign: 'left' | 'center' | 'right' | 'justify' = 'left';
      if (document.queryCommandState('justifyCenter')) textAlign = 'center';
      else if (document.queryCommandState('justifyRight')) textAlign = 'right';
      else if (document.queryCommandState('justifyFull')) textAlign = 'justify';

      setFormattingState({
        blockAlign,
        textAlign,
        bold,
        italic,
        underline,
        strikethrough,
        color,
        highlight,
        fontSize,
        blockType,
        blockLevel,
      });
    } catch {
      // Ignore
    }
  }, [activeBlock]);

  // Synchronize when activeBlock changes
  useEffect(() => {
    syncFormatting();
  }, [activeBlock, syncFormatting]);

  // Expose syncFormatting callback via ref
  useEffect(() => {
    if (syncRef) {
      syncRef.current = syncFormatting;
    }
    return () => {
      if (syncRef) {
        syncRef.current = null;
      }
    };
  }, [syncFormatting, syncRef]);

  // Listen to selectionchange event
  useEffect(() => {
    const handleSelectionChange = () => {
      syncFormatting();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [syncFormatting]);

  return (
    <FormattingStateContext.Provider value={{ formattingState, syncFormatting }}>
      {children}
    </FormattingStateContext.Provider>
  );
};
