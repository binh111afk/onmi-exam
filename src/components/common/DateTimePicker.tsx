import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
}

const parseDateTime = (str: string): Date => {
  if (!str) return new Date();
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
};

const formatDateTime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDisplay = (str: string): string => {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getFirstDayOfWeek = (y: number, m: number) => {
  const day = new Date(y, m, 1).getDay();
  // Monday as index 0, Sunday as index 6
  return day === 0 ? 6 : day - 1;
};

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Chọn thời gian...',
  className = '',
  id,
  disabled = false,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => parseDateTime(value));

  // Calendar navigation states
  const [viewMonth, setViewMonth] = useState<number>(() => selectedDate.getMonth());
  const [viewYear, setViewYear] = useState<number>(() => selectedDate.getFullYear());

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  // Re-sync local state when prop value changes
  useEffect(() => {
    const parsed = parseDateTime(value);
    setSelectedDate(parsed);
    setViewMonth(parsed.getMonth());
    setViewYear(parsed.getFullYear());
  }, [value]);

  // Handle popover scroll adjustments on load
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourListRef.current) {
          const selectedHourEl = hourListRef.current.children[selectedDate.getHours()] as HTMLElement;
          if (selectedHourEl) {
            hourListRef.current.scrollTop = selectedHourEl.offsetTop - hourListRef.current.offsetTop;
          }
        }
        if (minuteListRef.current) {
          const selectedMinuteEl = minuteListRef.current.children[selectedDate.getMinutes()] as HTMLElement;
          if (selectedMinuteEl) {
            minuteListRef.current.scrollTop = selectedMinuteEl.offsetTop - minuteListRef.current.offsetTop;
          }
        }
      }, 50);
    }
  }, [isOpen, selectedDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
  };

  const handleConfirm = () => {
    onChange(formatDateTime(selectedDate));
    setIsOpen(false);
  };

  // Generate calendar grid elements
  const firstDayIndex = getFirstDayOfWeek(viewYear, viewMonth);
  const totalDays = daysInMonth(viewYear, viewMonth);
  const today = new Date();

  const dayCells = useMemo(() => {
    const cells: React.ReactNode[] = [];
    // Padding
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`pad-${i}`} className="w-[26px] h-[26px]" />);
    }
    // Days
    for (let d = 1; d <= totalDays; d++) {
      const isSelected =
        selectedDate.getDate() === d &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getFullYear() === viewYear;
      const isToday =
        today.getDate() === d &&
        today.getMonth() === viewMonth &&
        today.getFullYear() === viewYear;

      cells.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={() => {
            const nextDate = new Date(selectedDate);
            nextDate.setDate(d);
            nextDate.setMonth(viewMonth);
            nextDate.setFullYear(viewYear);
            setSelectedDate(nextDate);
          }}
          className={`w-[26px] h-[26px] text-[9px] font-black rounded-full flex items-center justify-center transition-colors cursor-pointer select-none ${
            isSelected
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-150'
              : isToday
              ? 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50/50'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {d}
        </button>
      );
    }
    return cells;
  }, [viewYear, viewMonth, selectedDate, firstDayIndex, totalDays]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-[10px] font-bold text-slate-800 flex items-center justify-between hover:border-slate-300 transition outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer select-none text-left ${
          disabled ? 'opacity-45 cursor-not-allowed bg-slate-50' : ''
        }`}
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400 font-medium'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarIcon size={13} className="text-slate-400 shrink-0 ml-2" />
      </button>

      {/* Backdrop Close Click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Popover Dropdown Picker */}
      {isOpen && (
        <div className={`absolute z-50 ${align === 'left' ? 'left-0' : 'right-0'} bottom-full mb-2 bg-white border border-slate-100 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-2.5 flex flex-col items-center animate-scaleIn select-none w-[290px]`}>
          <div className="flex gap-2">
            {/* Calendar View (194px wide) */}
            <div className="w-[194px] flex flex-col">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                  Tháng {viewMonth + 1} Năm {viewYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-lg transition cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-lg transition cursor-pointer"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* Day Abbr Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[8px] uppercase mb-2">
                <div>H</div>
                <div>B</div>
                <div>T</div>
                <div>N</div>
                <div>S</div>
                <div>B</div>
                <div>C</div>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {dayCells}
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-px bg-slate-100 shrink-0 self-stretch my-1" />

            {/* Time Picker Pane */}
            <div className="flex flex-col justify-between">
              <div className="flex items-center gap-1 mb-2">
                <Clock size={12} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giờ/Phút</span>
              </div>
              <div className="flex gap-1">
                {/* Hours Column */}
                <div
                  ref={hourListRef}
                  className="flex flex-col overflow-y-auto h-[155px] w-[26px] border-r border-slate-50 pr-1 [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        const nextDate = new Date(selectedDate);
                        nextDate.setHours(h);
                        setSelectedDate(nextDate);
                      }}
                      className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors cursor-pointer ${
                        selectedDate.getHours() === h
                          ? 'bg-indigo-50 text-indigo-600 font-extrabold shadow-sm'
                          : 'text-slate-655 hover:bg-slate-50'
                      }`}
                    >
                      {h.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>

                {/* Minutes Column */}
                <div
                  ref={minuteListRef}
                  className="flex flex-col overflow-y-auto h-[155px] w-[26px] pr-1 [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                  {Array.from({ length: 60 }, (_, m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        const nextDate = new Date(selectedDate);
                        nextDate.setMinutes(m);
                        setSelectedDate(nextDate);
                      }}
                      className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors cursor-pointer ${
                        selectedDate.getMinutes() === m
                          ? 'bg-indigo-50 text-indigo-600 font-extrabold shadow-sm'
                          : 'text-slate-655 hover:bg-slate-50'
                      }`}
                    >
                      {m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 w-full shrink-0">
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1.5 text-[9px] font-black text-slate-500 hover:text-slate-800 transition cursor-pointer hover:bg-slate-50 rounded-lg"
            >
              Xóa
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1.5 text-[9px] font-black text-indigo-600 hover:text-indigo-800 transition cursor-pointer hover:bg-[#F1EEFC]/45 rounded-lg"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-3.5 py-1.5 text-[9px] font-black bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer shadow-sm shadow-indigo-100"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
