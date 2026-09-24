import React, { useRef, useState, useCallback, useEffect } from 'react';
import { containsLatexDelimiter, LatexText } from './LatexText';

/**
 * EditableText — shared text input for Timeline, Flow, Tabs and future blocks.
 *
 * Responsibilities:
 * - Stops keyboard event propagation so editor shortcuts never fire during text editing.
 * - Correctly handles Vietnamese IME (composition). During composition, deferred onChange
 *   is suppressed until compositionend so the host only receives committed text.
 * - Supports both <input> (single-line) and <textarea> (multiline) rendering.
 * - Forwards ref to the underlying element for external focus control.
 */

type InputMode = 'input' | 'textarea';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  mode?: InputMode;
  onBlur?: () => void;
  onFocus?: () => void;
  autoFocus?: boolean;
  id?: string;
}

export const EditableText = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  EditableTextProps
>(({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 1,
  mode = 'input',
  onBlur,
  onFocus,
  autoFocus,
  id,
}, ref) => {
  // Track whether an IME composition is in progress
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  // Local draft held during composition so we don't commit mid-composition
  const [draft, setDraft] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Always stop propagation so the editor container never receives these events
    e.stopPropagation();
  }, []);

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
    // Initialize draft from the committed value
    setDraft(null);
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    composingRef.current = false;
    setDraft(null);
    // Commit the final composed value
    onChange((e.target as HTMLInputElement | HTMLTextAreaElement).value);
  }, [onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (composingRef.current) {
      // During composition: only update the local draft, not the parent state.
      // This prevents React from resetting the input value mid-composition
      // which would break Vietnamese IME.
      setDraft(e.target.value);
      return;
    }
    setDraft(null);
    onChange(e.target.value);
  }, [onChange]);

  // Displayed value: during composition show the draft so React does not
  // overwrite the browser's IME candidate with the last committed value.
  const displayValue = draft !== null ? draft : value;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const assignRef = useCallback((node: HTMLInputElement | HTMLTextAreaElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const shouldRenderLatexPreview = !isEditing && containsLatexDelimiter(displayValue);

  if (shouldRenderLatexPreview) {
    return (
      <div
        id={id}
        role="button"
        tabIndex={0}
        onFocus={(e) => {
          e.stopPropagation();
          setIsEditing(true);
          onFocus?.();
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsEditing(true);
          }
        }}
        className={className}
      >
        <LatexText value={displayValue} />
      </div>
    );
  }

  const sharedProps = {
    id,
    ref: assignRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>,
    value: displayValue,
    placeholder,
    className,
    autoFocus,
    onKeyDown: handleKeyDown,
    onChange: handleChange,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onFocus: () => {
      setIsEditing(true);
      onFocus?.();
    },
    onBlur: () => {
      setIsEditing(false);
      onBlur?.();
    },
    // Prevent pointer events from bubbling and triggering block selection
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
  };

  if (mode === 'textarea') {
    return <textarea {...sharedProps} rows={rows} />;
  }

  return <input {...sharedProps} type="text" />;
});

EditableText.displayName = 'EditableText';
