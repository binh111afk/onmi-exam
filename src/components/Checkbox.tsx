import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Reusable animated premium custom Checkbox component.
 * Replaces native HTML checkboxes with custom scale and checkmark animations.
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  className = '',
  id,
}) => {
  return (
    <label
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group text-xs font-bold text-text-primary ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        {/* Hidden native checkbox for accessibility and compatibility */}
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
        />
        
        {/* Animated Custom Visual Box */}
        <div
          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90 ${
            checked
              ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
              : 'border-slate-300 bg-white hover:border-primary/50 group-hover:scale-[1.05]'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-3.5 h-3.5 stroke-[3] transition-all duration-200 ${
              checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      
      {label && (
        <span className="text-text-primary group-hover:text-black transition-colors font-bold text-xs">
          {label}
        </span>
      )}
    </label>
  );
};
