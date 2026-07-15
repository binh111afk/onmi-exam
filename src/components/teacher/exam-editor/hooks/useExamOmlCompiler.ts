import React, { useState, useEffect } from 'react';
import { parseOML } from '../../../ExamEditor/OmlRenderer/parser';

interface UseExamOmlCompilerProps {
  examJsonCode: string;
  setExamJsonCode: (code: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  quickTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const useExamOmlCompiler = ({
  examJsonCode,
  setExamJsonCode,
  textareaRef,
  quickTextareaRef,
}: UseExamOmlCompilerProps) => {
  // Parser and validation states
  const [lastValidOml, setLastValidOml] = useState<any>(() => {
    const result = parseOML(examJsonCode);
    return result.success ? result.data : null;
  });
  const [lastValidMetadata, setLastValidMetadata] = useState<any>(() => {
    const result = parseOML(examJsonCode);
    return result.metadata;
  });
  const [validationErrors, setValidationErrors] = useState<any[]>(() => {
    const result = parseOML(examJsonCode);
    return result.success ? [] : result.errors;
  });
  const [isJsonInvalid, setIsJsonInvalid] = useState<boolean>(() => {
    const result = parseOML(examJsonCode);
    return !result.success;
  });
  const [validationDialog, setValidationDialog] = useState<any>({
    isOpen: false,
    title: '',
    success: false,
    type: 'success',
  });
  const [compileStatus, setCompileStatus] = useState<'unchecked' | 'compiling' | 'success' | 'error'>(() => {
    const result = parseOML(examJsonCode);
    return result.success ? 'success' : 'error';
  });

  const getErrorNumberSymbol = (idx: number): string => {
    const symbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
    return symbols[idx] ?? `${idx + 1}.`;
  };

  const highlightLineInTextarea = (lineNum: number) => {
    const textarea = textareaRef.current || quickTextareaRef.current;
    if (!textarea) return;
    const lines = textarea.value.split('\n');
    if (lineNum > lines.length) return;
    let startOffset = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      startOffset += lines[i].length + (textarea.value.includes('\r\n') ? 2 : 1);
    }
    const endOffset = startOffset + lines[lineNum - 1].length;
    textarea.focus();
    textarea.setSelectionRange(startOffset, endOffset);
    const rowHeight = 20;
    textarea.scrollTop = Math.max(0, (lineNum - 5) * rowHeight);
  };

  // Real-time parsed OML sync with Debounce (300-500ms)
  useEffect(() => {
    setCompileStatus('unchecked');

    const handler = setTimeout(() => {
      const result = parseOML(examJsonCode);
      if (result.success) {
        setLastValidOml(result.data);
        setLastValidMetadata(result.metadata);
        setValidationErrors([]);
        setIsJsonInvalid(false);
      } else {
        setValidationErrors(result.errors);
        setIsJsonInvalid(true);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [examJsonCode]);

  const handleCheckCode = () => {
    if (compileStatus === 'compiling') return;
    setCompileStatus('compiling');

    setTimeout(() => {
      const result = parseOML(examJsonCode);
      if (result.success) {
        setCompileStatus('success');
        setLastValidOml(result.data);
        setLastValidMetadata(result.metadata);
        setValidationErrors([]);
        setIsJsonInvalid(false);
        setValidationDialog({
          isOpen: true,
          title: 'Kiểm tra thành công',
          success: true,
          type: 'success',
          errors: [],
          metadata: result.metadata,
        });

        setTimeout(() => {
          setValidationDialog((prev: any) => ({ ...prev, isOpen: false }));
        }, 2000);
      } else {
        setCompileStatus('error');
        setValidationErrors(result.errors);
        setIsJsonInvalid(true);
        setValidationDialog({
          isOpen: true,
          title: 'Không thể biên dịch OML',
          success: false,
          type: result.errors[0]?.type === 'syntax' ? 'syntax' : 'schema',
          errors: result.errors,
          metadata: result.metadata,
        });
      }
    }, 600);
  };

  return {
    lastValidOml,
    setLastValidOml,
    lastValidMetadata,
    setLastValidMetadata,
    validationErrors,
    setValidationErrors,
    isJsonInvalid,
    setIsJsonInvalid,
    compileStatus,
    setCompileStatus,
    validationDialog,
    setValidationDialog,
    getErrorNumberSymbol,
    highlightLineInTextarea,
    handleCheckCode,
  };
};
