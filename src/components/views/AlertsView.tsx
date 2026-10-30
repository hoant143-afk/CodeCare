import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { LearnerDerived, TeacherConfirmation } from '../../types';

interface AlertsViewProps {
  learners: LearnerDerived[];
  onSelectLearner: (learnerId: string) => void;
  onReviewAlert: (learnerId: string, decision: TeacherConfirmation, notes?: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  learners,
  onSelectLearner,
  onReviewAlert,
}) => {
  const [filterState, setFilterState] = useState<'ALL' | TeacherConfirmation>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'ALERT' | 'WATCH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect flagged learners
  const flaggedLearners = useMemo(() => {
    return learners.filter((l) => l.alert_status === 'ALERT' || l.alert_status === 'WATCH');
  }, [learners]);

  const filteredAlerts = useMemo(() => {
    return flaggedLearners.filter((l) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!l.learner_id.toLowerCase().includes(q)) return false;
      }
      if (filterState !== 'ALL' && l.teacher_confirmation !== filterState) return false;
      if (severityFilter !== 'ALL' && l.alert_status !== severityFilter) return false;
      return true;
    });
  }, [flaggedLearners, searchQuery, filterState, severityFilter]);

  const unreviewedCount = flaggedLearners.filter((l) => l.teacher_confirmation === 'UNREVIEWED').length;
  const confirmedCount = flaggedLearners.filter((l) => l.teacher_confirmation === 'CONFIRMED').length;
  const watchingCount = flaggedLearners.filter((l) => l.teacher_confirmation === 'WATCHING').length;
  const dismissedCount = flaggedLearners.filter((l) => l.teacher_confirmation === 'DISMISSED').length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Trung tâm Cảnh báo Sớm ({flaggedLearners.length} cảnh báo)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Hệ thống đưa ra bằng chứng định lượng (Evidence Score) kèm lý do cụ thể. Toàn bộ cảnh báo đều chờ giáo viên phê duyệt.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Segmented Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterState('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterState === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({flaggedLearners.length})
            </button>

            <button
              onClick={() => setFilterState('UNREVIEWED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                filterState === 'UNREVIEWED'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Chưa xem ({unreviewedCount})
            </button>

            <button
              onClick={() => setFilterState('CONFIRMED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterState === 'CONFIRMED'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Đã xác nhận ({confirmedCount})
            </button>

            <button
              onClick={() => setFilterState('WATCHING')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterState === 'WATCHING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Đang theo dõi ({watchingCount})
            </button>

            <button
              onClick={() => setFilterState('DISMISSED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterState === 'DISMISSED'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Đã bác bỏ ({dismissedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Mức độ:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-800"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="ALERT">Cần hỗ trợ (&ge; 4 điểm)</option>
              <option value="WATCH">Theo dõi thêm (3 điểm)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã người học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-600 font-mono"
          />
        </div>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-xs">
            Không có cảnh báo nào trong mục lọc này.
          </div>
        ) : (
          filteredAlerts.map((l) => (
            <div
              key={l.learner_id}
              className={`bg-white rounded-xl border p-4.5 transition-all shadow-2xs space-y-3 ${
                l.alert_status === 'ALERT'
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => onSelectLearner(l.learner_id)}
                    className="font-mono font-bold text-sky-900 text-base hover:underline"
                  >
                    {l.learner_id}
                  </button>
                  <span className="text-slate-500 font-medium text-xs">({l.class_name})</span>
                  
                  {/* Status Badge */}
                  {l.alert_status === 'ALERT' ? (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                      Có dấu hiệu cần hỗ trợ
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      Theo dõi thêm
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    Evidence Score: {l.evidence_score}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Trạng thái GV:</span>
                  {l.teacher_confirmation === 'CONFIRMED' && (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã xác nhận cần hỗ trợ
                    </span>
                  )}
                  {l.teacher_confirmation === 'WATCHING' && (
                    <span className="font-semibold text-amber-700 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Đang theo dõi
                    </span>
                  )}
                  {l.teacher_confirmation === 'DISMISSED' && (
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Đã bác bỏ
                    </span>
                  )}
                  {l.teacher_confirmation === 'UNREVIEWED' && (
                    <span className="font-semibold text-rose-700 flex items-center gap-1">
                      Chưa xem xét
                    </span>
                  )}
                </div>
              </div>

              {/* Reasons & Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left 2 cols: Explainable Reasons */}
                <div className="lg:col-span-2 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lý do hệ thống cảnh báo (Explainable Evidence):</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {l.alert_reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>

                  {l.teacher_notes && (
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                      <span className="font-semibold text-slate-800">Ghi chú giáo viên: </span>
                      {l.teacher_notes}
                    </div>
                  )}
                </div>

                {/* Right col: Quick Snapshot metrics */}
                <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Hoàn thành:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {Math.round(l.submission_rate * 100)}% ({l.assignments_submitted}/{l.assignments_due})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Test Pass:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {Math.round(l.test_pass_rate * 100)}% ({l.tests_passed}/{l.total_tests})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Lần chạy & Lỗi:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {l.code_runs} lần ({l.total_errors} lỗi)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Hoạt động 7 ngày:</span>
                    <span className="font-medium text-slate-800">
                      {l.active_days_7d} ngày ({l.login_count_7d} login)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="text-[11px] text-slate-500 italic">
                  * Hệ thống không tự động quyết định can thiệp. Mọi hành động cần giáo viên phê duyệt.
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onSelectLearner(l.learner_id)}
                    className="px-3 py-1.5 font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Xem chi tiết hồ sơ
                  </button>

                  <button
                    onClick={() => onReviewAlert(l.learner_id, 'CONFIRMED')}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                      l.teacher_confirmation === 'CONFIRMED'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Xác nhận cần hỗ trợ</span>
                  </button>

                  <button
                    onClick={() => onReviewAlert(l.learner_id, 'WATCHING')}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                      l.teacher_confirmation === 'WATCHING'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Theo dõi thêm</span>
                  </button>

                  <button
                    onClick={() => onReviewAlert(l.learner_id, 'DISMISSED')}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                      l.teacher_confirmation === 'DISMISSED'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Bác bỏ</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
