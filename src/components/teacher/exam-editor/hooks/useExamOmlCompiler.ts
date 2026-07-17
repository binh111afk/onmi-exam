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
    if (examJsonCode.trim() === '') {
      return { version: "1.0", info: {}, content: [] };
    }
    const result = parseOML(examJsonCode);
    return result.success ? result.data : null;
  });
  const [lastValidMetadata, setLastValidMetadata] = useState<any>(() => {
    if (examJsonCode.trim() === '') {
      return {
        title: 'Đề thi trống',
        subject: '',
        grade: '',
        time: 0,
        questionCount: 0,
        version: '1.0'
      };
    }
    const result = parseOML(examJsonCode);
    return result.metadata;
  });
  const [validationErrors, setValidationErrors] = useState<any[]>(() => {
    if (examJsonCode.trim() === '') {
      return [];
    }
    const result = parseOML(examJsonCode);
    return result.success ? [] : result.errors;
  });
  const [isJsonInvalid, setIsJsonInvalid] = useState<boolean>(() => {
    if (examJsonCode.trim() === '') {
      return false;
    }
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
    if (examJsonCode.trim() === '') {
      return 'success';
    }
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
    const text = textarea.value;
    const lines = text.split(/\r?\n/);
    if (lineNum > lines.length) return;

    let startOffset = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      const posAfterLine = startOffset + lines[i].length;
      const hasCarriageReturn = text.charAt(posAfterLine) === '\r';
      const delimiterLength = hasCarriageReturn ? 2 : 1;
      startOffset += lines[i].length + delimiterLength;
    }
    const endOffset = startOffset + lines[lineNum - 1].length;

    textarea.focus();
    textarea.setSelectionRange(startOffset, endOffset);
    const parentContainer = textarea.parentElement?.parentElement;
    if (parentContainer) {
      const rowHeight = 18;
      parentContainer.scrollTop = Math.max(0, (lineNum - 5) * rowHeight);
    }
  };

  // Real-time parsed OML sync with Debounce (300-500ms)
  useEffect(() => {
    if (examJsonCode.trim() === '') {
      setLastValidOml({ version: "1.0", info: {}, content: [] });
      setLastValidMetadata({
        title: 'Đề thi trống',
        subject: '',
        grade: '',
        time: 0,
        questionCount: 0,
        version: '1.0'
      });
      setValidationErrors([]);
      setIsJsonInvalid(false);
      setCompileStatus('success');
      return;
    }

    setCompileStatus('unchecked');

    const handler = setTimeout(() => {
      const result = parseOML(examJsonCode);
      if (result.data) {
        setLastValidOml(result.data);
        setLastValidMetadata(result.metadata);
      }
      if (result.success) {
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
      if (examJsonCode.trim() === '') {
        setCompileStatus('success');
        setLastValidOml({ version: "1.0", info: {}, content: [] });
        setLastValidMetadata({
          title: 'Đề thi trống',
          subject: '',
          grade: '',
          time: 0,
          questionCount: 0,
          version: '1.0'
        });
        setValidationErrors([]);
        setIsJsonInvalid(false);
        setValidationDialog({
          isOpen: true,
          title: 'Kiểm tra thành công',
          success: true,
          type: 'success',
          errors: [],
          metadata: {
            title: 'Đề thi trống',
            subject: '',
            grade: '',
            time: 0,
            questionCount: 0,
            version: '1.0'
          },
        });

        setTimeout(() => {
          setValidationDialog((prev: any) => ({ ...prev, isOpen: false }));
        }, 2000);
        return;
      }

      const result = parseOML(examJsonCode);
      if (result.data) {
        setLastValidOml(result.data);
        setLastValidMetadata(result.metadata);
      }
      if (result.success) {
        setCompileStatus('success');
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
