import React, { useState } from 'react';
import {
  History,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Eye,
  XCircle,
  FileText,
} from 'lucide-react';
import { AuditLogItem } from '../../types';
import { StorageService } from '../../services/storage';

export const AuditLogsView: React.FC = () => {
  const [logs] = useState<AuditLogItem[]>(StorageService.getAuditLogs());
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      log.learner_id.toLowerCase().includes(q) ||
      log.event_type.toLowerCase().includes(q) ||
      log.teacher_decision.toLowerCase().includes(q) ||
      log.reasons.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-sky-800" />
            <span>Nhật ký Hoạt động AI & Quyết định Giáo viên (Audit Log)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Lưu vết toàn diện các sự kiện sinh cảnh báo, xác nhận, từ chối và can thiệp nhằm đảm bảo tính minh bạch giải trình (Accountability).
          </p>
        </div>
      </div>

      {/* Search box */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã người học, sự kiện hoặc quyết định..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-600"
          />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
              <tr>
                <th className="py-3 px-3.5">Thời gian</th>
                <th className="py-3 px-3">Mã người học</th>
                <th className="py-3 px-3">Sự kiện</th>
                <th className="py-3 px-3">Lý do ghi nhận</th>
                <th className="py-3 px-3">Kết quả hệ thống</th>
                <th className="py-3 px-3">Quyết định của GV</th>
                <th className="py-3 px-3.5">Ghi chú & Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không có nhật ký nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sky-950">
                      {log.learner_id}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {log.event_type}
                    </td>
                    <td className="py-3 px-3 max-w-xs text-slate-600">
                      {log.reasons}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                        {log.system_result}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {log.teacher_decision.includes('xác nhận') ? (
                        <span className="text-emerald-700 font-semibold">{log.teacher_decision}</span>
                      ) : log.teacher_decision.includes('theo dõi') ? (
                        <span className="text-amber-700 font-semibold">{log.teacher_decision}</span>
                      ) : (
                        <span className="text-slate-600">{log.teacher_decision}</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-sm">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
