import React from 'react';
import { ShieldCheck, Bell, Sparkles, BookOpen, UserCheck, AlertCircle } from 'lucide-react';
import { ClassName } from '../../types';

interface HeaderProps {
  selectedClass: 'ALL' | ClassName;
  onClassChange: (className: 'ALL' | ClassName) => void;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  unreviewedAlertsCount: number;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedClass,
  onClassChange,
  selectedWeek,
  onWeekChange,
  unreviewedAlertsCount,
  onOpenAlerts,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand wordmark & project scope */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-900 text-white flex items-center justify-center font-bold tracking-tight text-lg shadow-xs">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">CodeCare</span>
              <span className="text-xs text-sky-800 font-medium px-2 py-0.5 bg-sky-50 border border-sky-200 rounded">
                Learning Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Hệ thống cảnh báo sớm & hỗ trợ can thiệp trong học lập trình
            </p>
          </div>
        </div>

        {/* Center: Contextual filters (Class, Week) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 text-xs">
            <span className="text-slate-500 px-2 font-medium">Lớp:</span>
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value as 'ALL' | ClassName)}
              className="bg-white text-slate-800 font-medium rounded px-2.5 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-600 text-xs shadow-2xs"
            >
              <option value="ALL">Tất cả các lớp (80 SV)</option>
              <option value="LOP_A">Lớp A (28 SV)</option>
              <option value="LOP_B">Lớp B (26 SV)</option>
              <option value="LOP_C">Lớp C (26 SV)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 text-xs">
            <span className="text-slate-500 px-2 font-medium">Tuần:</span>
            <select
              value={selectedWeek}
              onChange={(e) => onWeekChange(Number(e.target.value))}
              className="bg-white text-slate-800 font-medium rounded px-2.5 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-600 text-xs shadow-2xs"
            >
              <option value={6}>Tuần 6 (Hiện tại)</option>
              <option value={5}>Tuần 5</option>
              <option value={4}>Tuần 4</option>
              <option value={3}>Tuần 3</option>
              <option value={2}>Tuần 2</option>
              <option value={1}>Tuần 1</option>
            </select>
          </div>
        </div>

        {/* Right: Academic trust badges, notification button & Teacher Profile */}
        <div className="flex items-center gap-3">
          {/* Ethics Micro Badges */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded text-[11px] font-medium">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Dữ liệu giả lập
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded text-[11px] font-medium">
              <UserCheck className="w-3 h-3 text-emerald-600" />
              Human-in-the-loop
            </span>
          </div>

          {/* Alert button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center"
            title="Xem các cảnh báo cần giáo viên xem xét"
          >
            <Bell className="w-4 h-4" />
            {unreviewedAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreviewedAlertsCount}
              </span>
            )}
          </button>

          {/* Teacher demo badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center text-xs font-semibold">
              GV
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800">TS. Nguyễn Văn Hùng</div>
              <div className="text-[11px] text-slate-500">Giảng viên CS101</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
