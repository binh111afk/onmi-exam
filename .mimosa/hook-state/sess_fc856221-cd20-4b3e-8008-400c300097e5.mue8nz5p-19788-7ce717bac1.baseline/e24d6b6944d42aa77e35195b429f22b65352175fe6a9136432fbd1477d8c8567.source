import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle2, AlertTriangle, XCircle, Info, HelpCircle } from 'lucide-react';

interface AlertOptions {
  type: 'success' | 'error' | 'warning' | 'info' | 'question' | 'danger';
  title: string;
  description?: string;
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'danger';
}

interface PromptOptions {
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'danger';
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => Promise<void>;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showPrompt: (options: PromptOptions) => Promise<string | null>;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
};

const AlertPortal: React.FC<{
  isOpen: boolean;
  type: 'alert' | 'confirm' | 'prompt';
  alertType?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'danger';
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}> = ({
  isOpen,
  type,
  alertType = 'info',
  title,
  description,
  defaultValue = '',
  placeholder = '',
  confirmLabel = 'Đồng ý',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (alertType) {
      case 'success':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100/50">
            <XCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-550 shadow-sm border border-amber-100/50">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
      case 'question':
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100/50">
            <HelpCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
      case 'danger':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100/50">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50">
            <Info className="w-6 h-6 stroke-[2.5]" />
          </div>
        );
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/15 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
        onClick={type === 'alert' ? () => onConfirm() : onCancel}
      />
      
      {/* Light Surface Container */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-scaleIn select-none">
        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center text-center space-y-3.5">
            {getIcon()}
            <div className="space-y-1.5 w-full">
              <h3 className="text-sm font-black text-slate-800 leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                  {description}
                </p>
              )}
            </div>
          </div>

          {type === 'prompt' && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onConfirm(inputValue);
                } else if (e.key === 'Escape') {
                  onCancel();
                }
              }}
              autoFocus
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary focus:border-primary transition bg-slate-50/50 text-slate-800"
            />
          )}

          <div className="flex items-center justify-center gap-2.5 pt-1">
            {type !== 'alert' && (
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-[10px] font-bold rounded-xl transition cursor-pointer"
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={() => onConfirm(type === 'prompt' ? inputValue : undefined)}
              className={`px-4 py-2 text-[10px] font-black rounded-xl shadow-sm hover:shadow transition cursor-pointer ${
                alertType === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white shadow-indigo-50'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogState, setDialogState] = useState<{
    type: 'alert' | 'confirm' | 'prompt';
    alertType?: 'success' | 'error' | 'warning' | 'info' | 'question' | 'danger';
    title: string;
    description?: string;
    defaultValue?: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }>({
    type: 'alert',
    title: '',
  });

  const resolverRef = useRef<((value?: any) => void) | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setDialogState({
      type: 'alert',
      alertType: options.type,
      title: options.title,
      description: options.description,
      confirmLabel: 'Đóng'
    });
    setIsOpen(true);
    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setDialogState({
      type: 'confirm',
      alertType: options.type || 'question',
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel || 'Xác nhận',
      cancelLabel: options.cancelLabel || 'Hủy'
    });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const showPrompt = useCallback((options: PromptOptions) => {
    setDialogState({
      type: 'prompt',
      alertType: options.type || 'info',
      title: options.title,
      description: options.description,
      defaultValue: options.defaultValue || '',
      placeholder: options.placeholder || '',
      confirmLabel: 'Lưu',
      cancelLabel: 'Hủy'
    });
    setIsOpen(true);
    return new Promise<string | null>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = (value?: string) => {
    setIsOpen(false);
    if (resolverRef.current) {
      if (dialogState.type === 'confirm') {
        resolverRef.current(true);
      } else if (dialogState.type === 'prompt') {
        resolverRef.current(value || '');
      } else {
        resolverRef.current();
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      if (dialogState.type === 'confirm') {
        resolverRef.current(false);
      } else if (dialogState.type === 'prompt') {
        resolverRef.current(null);
      } else {
        resolverRef.current();
      }
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      <AlertPortal
        isOpen={isOpen}
        type={dialogState.type}
        alertType={dialogState.alertType}
        title={dialogState.title}
        description={dialogState.description}
        defaultValue={dialogState.defaultValue}
        placeholder={dialogState.placeholder}
        confirmLabel={dialogState.confirmLabel}
        cancelLabel={dialogState.cancelLabel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
};
