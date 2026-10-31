import React from 'react';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  HeartHandshake,
  ShieldCheck,
  Database,
  Sliders,
  FileCheck2,
  History,
  FileCode2,
  BookMarked,
  Info,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'learners'
  | 'alerts'
  | 'interventions'
  | 'audit'
  | 'data'
  | 'settings'
  | 'survey'
  | 'logs'
  | 'testcases'
  | 'responsible_ai';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreviewedAlertsCount: number;
  activeInterventionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  unreviewedAlertsCount,
  activeInterventionsCount,
}) => {
  const mainNavItems = [
    { id: 'overview' as NavTab, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'learners' as NavTab, label: 'Người học', icon: Users },
    {
      id: 'alerts' as NavTab,
      label: 'Cảnh báo',
      icon: AlertTriangle,
      badge: unreviewedAlertsCount > 0 ? unreviewedAlertsCount : null,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold',
    },
    {
      id: 'interventions' as NavTab,
      label: 'Can thiệp sư phạm',
      icon: HeartHandshake,
      badge: activeInterventionsCount > 0 ? activeInterventionsCount : null,
      badgeColor: 'bg-sky-100 text-sky-900 border border-sky-300 font-semibold',
    },
    { id: 'audit' as NavTab, label: 'Audit mô hình', icon: ShieldCheck },
    { id: 'data' as NavTab, label: 'Quản trị dữ liệu', icon: Database },
    { id: 'settings' as NavTab, label: 'Cài đặt ngưỡng', icon: Sliders },
  ];

  const secondaryNavItems = [
    { id: 'survey' as NavTab, label: 'Đánh giá GV', icon: FileCheck2 },
    { id: 'logs' as NavTab, label: 'Nhật ký AI / Audit Log', icon: History },
    { id: 'testcases' as NavTab, label: 'Kịch bản kiểm thử (13)', icon: FileCode2 },
    { id: 'responsible_ai' as NavTab, label: 'AI có trách nhiệm', icon: BookMarked },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Scope banner */}
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Học phần thử nghiệm
        </div>
        <div className="text-sm font-medium text-white truncate">
          CS101: Nhập môn Lập trình
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          Học kỳ 1 · 80 người học
        </div>
      </div>

      {/* Main navigation */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Nghiệp vụ giáo viên
        </div>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-sky-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Học thuật & Đánh giá
        </div>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-sky-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Statement */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 leading-relaxed">
        <div className="flex items-start gap-1.5 mb-1 text-slate-300 font-medium">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <span>Nguyên tắc Human-in-the-loop</span>
        </div>
        Hệ thống chỉ hỗ trợ phát hiện tín hiệu. Quyết định can thiệp cuối cùng thuộc về giáo viên.
      </div>
    </aside>
  );
};
