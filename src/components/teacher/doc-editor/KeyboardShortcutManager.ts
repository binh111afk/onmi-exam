import React from 'react';

export type ShortcutCommand = 
  | 'bold'
  | 'italic'
  | 'underline'
  | 'ordered-list'
  | 'bullet-list'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'undo'
  | 'redo'
  | 'duplicate';

/**
 * Checks a React KeyboardEvent and returns the matching ShortcutCommand, if any.
 * Returns null if no shortcut matches.
 */
export function matchKeyboardShortcut(e: React.KeyboardEvent<HTMLDivElement> | KeyboardEvent): ShortcutCommand | null {
  const isCtrl = e.ctrlKey || e.metaKey;
  const isShift = e.shiftKey;
  const isAlt = e.altKey;
  const key = e.key.toLowerCase();

  // Ctrl + B -> Bold
  if (isCtrl && !isShift && !isAlt && key === 'b') {
    return 'bold';
  }
  // Ctrl + I -> Italic
  if (isCtrl && !isShift && !isAlt && key === 'i') {
    return 'italic';
  }
  // Ctrl + U -> Underline
  if (isCtrl && !isShift && !isAlt && key === 'u') {
    return 'underline';
  }
  // Ctrl + Shift + 7 -> Ordered List
  if (isCtrl && isShift && !isAlt && (key === '7' || e.key === '&')) {
    return 'ordered-list';
  }
  // Ctrl + Shift + 8 -> Bullet List
  if (isCtrl && isShift && !isAlt && (key === '8' || e.key === '*')) {
    return 'bullet-list';
  }
  // Ctrl + Alt + 1 -> Heading 1
  if (isCtrl && !isShift && isAlt && key === '1') {
    return 'heading-1';
  }
  // Ctrl + Alt + 2 -> Heading 2
  if (isCtrl && !isShift && isAlt && key === '2') {
    return 'heading-2';
  }
  // Ctrl + Alt + 3 -> Heading 3
  if (isCtrl && !isShift && isAlt && key === '3') {
    return 'heading-3';
  }
  // Ctrl + Shift + Z -> Redo
  if (isCtrl && isShift && !isAlt && key === 'z') {
    return 'redo';
  }
  // Ctrl + Z -> Undo
  if (isCtrl && !isShift && !isAlt && key === 'z') {
    return 'undo';
  }
  // Ctrl + Y -> Redo
  if (isCtrl && !isShift && !isAlt && key === 'y') {
    return 'redo';
  }
  // Ctrl + D -> Duplicate Block
  if (isCtrl && !isShift && !isAlt && key === 'd') {
    return 'duplicate';
  }

  return null;
}
