import { useCallback, useEffect } from 'react';

interface UseMindmapKeyboardOptions {
  enabled: boolean;
  isEditing: boolean;
  onAddSibling: () => void;
  onAddChild: () => void;
  onSelectParent: () => void;
  onDelete: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onMoveSelection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onToggleCollapse: () => void;
  onExitEditing: () => void;
}

export function useMindmapKeyboard(options: UseMindmapKeyboardOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!options.enabled) return;

    const target = event.target as HTMLElement | null;
    const isTextTarget = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

    if (options.isEditing || isTextTarget) {
      if (event.key === 'Escape') {
        event.preventDefault();
        options.onExitEditing();
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      options.onDuplicate();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      options.onCopy();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
      event.preventDefault();
      options.onPaste();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      options.onAddSibling();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        options.onSelectParent();
      } else {
        options.onAddChild();
      }
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      options.onDelete();
      return;
    }

    if (event.key === 'F2') {
      event.preventDefault();
      options.onRename();
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      options.onToggleCollapse();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      options.onExitEditing();
      return;
    }

    if (event.key === 'ArrowUp') options.onMoveSelection('up');
    if (event.key === 'ArrowDown') options.onMoveSelection('down');
    if (event.key === 'ArrowLeft') options.onMoveSelection('left');
    if (event.key === 'ArrowRight') options.onMoveSelection('right');
  }, [options]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

