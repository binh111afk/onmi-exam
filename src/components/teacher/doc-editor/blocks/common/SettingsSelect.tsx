import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface SettingsSelectOption {
  value: string;
  label: string;
}

interface SettingsSelectProps {
  value?: string;
  options: SettingsSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(options.findIndex(option => option.value === value), 0);
  const selectedOption = options[selectedIndex] ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !listRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !listRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const list = listRef.current;
      list.style.left = `${rect.left}px`;
      list.style.top = `${rect.bottom + 4}px`;
      list.style.minWidth = `${rect.width}px`;
      list.style.maxWidth = `${Math.max(rect.width, 180)}px`;
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(selectedIndex);
    requestAnimationFrame(() => listRef.current?.focus());
  }, [isOpen, selectedIndex]);

  const openSelect = () => {
    setIsOpen(true);
  };

  const closeSelect = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const commitValue = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      openSelect();
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSelect();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, options.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const activeOption = options[activeIndex];
      if (activeOption) commitValue(activeOption.value);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`bg-white border border-slate-200 focus:border-primary rounded-xl px-3 py-2 font-bold text-slate-800 outline-none transition cursor-pointer text-[10px] flex items-center justify-between gap-2 text-left focus:ring-2 focus:ring-primary/10 ${className}`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown size={13} className={`shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          onKeyDown={handleListKeyDown}
          className="fixed z-[10050] max-h-60 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1 shadow-2xl text-[10px] font-bold text-slate-700 animate-fadeIn"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commitValue(option.value)}
                className={`w-full rounded-lg px-3 py-2 text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-primary-light text-primary'
                    : isActive
                      ? 'bg-slate-50 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};
