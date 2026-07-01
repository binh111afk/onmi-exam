import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  /** visual variant */
  variant?: 'default' | 'ghost' | 'filled';
  /** size */
  size?: 'sm' | 'md';
  id?: string;
}

/**
 * Reusable premium custom styled select / dropdown component.
 * Replaces the generic browser native select overlay with a custom floating list.
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  variant = 'default',
  size = 'md',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value);

  const baseButtonClasses =
    'w-full text-left font-bold text-text-primary transition-all duration-150 flex items-center justify-between outline-none cursor-pointer select-none';

  const variantClasses: Record<string, string> = {
    default:
      'bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary',
    ghost:
      'bg-transparent border-none text-text-primary font-black focus:outline-none',
    filled:
      'bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'pl-3 pr-3.5 py-1.5 text-[11px]',
    md: 'pl-4 pr-4 py-2.5 text-xs',
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseButtonClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      >
        <span className={`truncate ${!selectedOption && placeholder ? 'text-slate-400 font-medium' : 'text-text-primary'}`}>
          {selectedOption ? selectedOption.label : (placeholder || 'Chọn...')}
        </span>
        {variant !== 'ghost' && (
          <ChevronDown
            size={size === 'sm' ? 12 : 14}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Options Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 w-full mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-1.5 animate-fadeIn">
          {options.map((opt) => {
            const isCurrent = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-primary-light text-primary'
                    : 'text-text-primary hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isCurrent && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
