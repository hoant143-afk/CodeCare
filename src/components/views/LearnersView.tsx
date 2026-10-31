import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  SlidersHorizontal,
  Download,
} from 'lucide-react';
import { LearnerDerived, ClassName, AlertStatus, ProgressTrend, TeacherConfirmation } from '../../types';
import { exportLearnersToCSV } from '../../services/exportService';

interface LearnersViewProps {
  learners: LearnerDerived[];
  onSelectLearner: (learnerId: string) => void;
}

export const LearnersView: React.FC<LearnersViewProps> = ({
  learners,
  onSelectLearner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<'ALL' | ClassName>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | AlertStatus>('ALL');
  const [selectedTrend, setSelectedTrend] = useState<'ALL' | ProgressTrend>('ALL');
  const [selectedReview, setSelectedReview] = useState<'ALL' | TeacherConfirmation>('ALL');
  const [sortField, setSortField] = useState<keyof LearnerDerived>('learner_id');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filter learners
  const filteredLearners = useMemo(() => {
    return learners.filter((l) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        if (!l.learner_id.toLowerCase().includes(query)) return false;
      }
      // Class
      if (selectedClass !== 'ALL' && l.class_name !== selectedClass) return false;
      // Status
      if (selectedStatus !== 'ALL' && l.alert_status !== selectedStatus) return false;
      // Trend
      if (selectedTrend !== 'ALL' && l.progress_trend !== selectedTrend) return false;
      // Review
      if (selectedReview !== 'ALL' && l.teacher_confirmation !== selectedReview) return false;

      return true;
    });
  }, [learners, searchTerm, selectedClass, selectedStatus, selectedTrend, selectedReview]);

  // Sort learners
  const sortedLearners = useMemo(() => {
    return [...filteredLearners].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
  }, [filteredLearners, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedLearners.length / pageSize) || 1;
  const paginatedLearners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLearners.slice(start, start + pageSize);
  }, [sortedLearners, currentPage, pageSize]);

  const handleSort = (field: keyof LearnerDerived) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for metrics
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Danh sách Người học ({learners.length} hồ sơ)
          </h1>
          <p className="text-xs text-slate-500">
            Dữ liệu học tập và lập trình ẩn danh. Không phân hạng hay gán nhãn cố định người học.
          </p>
        </div>

        <button
          onClick={() => exportLearnersToCSV(filteredLearners)}
          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs self-start sm:self-center"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Xuất CSV ({filteredLearners.length} SV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã người học (ví dụ: STU023)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-600 font-mono"
            />
          </div>

          {/* Quick Clear Filter */}
          {(searchTerm || selectedClass !== 'ALL' || selectedStatus !== 'ALL' || selectedTrend !== 'ALL' || selectedReview !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('ALL');
                setSelectedStatus('ALL');
                setSelectedTrend('ALL');
                setSelectedReview('ALL');
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[11px] text-slate-500 block mb-1 font-medium">Lớp học:</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="ALL">Tất cả các lớp</option>
              <option value="LOP_A">Lớp A</option>
              <option value="LOP_B">Lớp B</option>
              <option value="LOP_C">Lớp C</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1 font-medium">Tín hiệu cảnh báo:</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="ALL">Tất cả tín hiệu</option>
              <option value="ALERT">Có dấu hiệu cần hỗ trợ</option>
              <option value="WATCH">Theo dõi thêm</option>
              <option value="NORMAL">Bình thường</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1 font-medium">Xu hướng tiến độ:</label>
            <select
              value={selectedTrend}
              onChange={(e) => {
                setSelectedTrend(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="ALL">Tất cả xu hướng</option>
              <option value="IMPROVING">Đang cải thiện</option>
              <option value="STABLE">Ổn định</option>
              <option value="DECLINING">Có chiều hướng giảm</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 block mb-1 font-medium">Giáo viên xác nhận:</label>
            <select
              value={selectedReview}
              onChange={(e) => {
                setSelectedReview(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="UNREVIEWED">Chưa xem xét</option>
              <option value="CONFIRMED">Đã xác nhận cần hỗ trợ</option>
              <option value="WATCHING">Đang theo dõi</option>
              <option value="DISMISSED">Đã bác bỏ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th
                  onClick={() => handleSort('learner_id')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã người học</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Lớp</th>
                <th className="py-3 px-3">Mức hoạt động</th>
                <th
                  onClick={() => handleSort('submission_rate')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Hoàn thành</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('test_pass_rate')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Test pass</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('code_runs')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Số lần chạy</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total_errors')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Số lỗi</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Xu hướng</th>
                <th className="py-3 px-3">Tín hiệu cảnh báo</th>
                <th className="py-3 px-3">Xác nhận của GV</th>
                <th className="py-3 px-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLearners.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy người học nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedLearners.map((l) => (
                  <tr
                    key={l.learner_id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onSelectLearner(l.learner_id)}
                  >
                    {/* ID */}
                    <td className="py-3 px-3.5 font-mono font-bold text-sky-900">
                      {l.learner_id}
                    </td>

                    {/* Class */}
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {l.class_name}
                    </td>

                    {/* Activity */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          l.activity_level === 'Cao'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : l.activity_level === 'Trung bình'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {l.activity_level} ({l.active_days_7d}d/7)
                      </span>
                    </td>

                    {/* Submission rate */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span className={l.submission_rate < 0.7 ? 'text-rose-600 font-semibold' : 'text-slate-800'}>
                        {Math.round(l.submission_rate * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {l.assignments_submitted}/{l.assignments_due} bài
                      </span>
                    </td>

                    {/* Test pass rate */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span className={l.test_pass_rate < 0.5 ? 'text-rose-600 font-semibold' : 'text-emerald-700 font-semibold'}>
                        {Math.round(l.test_pass_rate * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {l.tests_passed}/{l.total_tests} test
                      </span>
                    </td>

                    {/* Code runs */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      {l.code_runs}
                    </td>

                    {/* Total errors */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      {l.total_errors}
                      <span className="text-[10px] text-slate-400 block">
                        {Math.round(l.error_rate * 100)}% lần chạy
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="py-3 px-3">
                      {l.progress_trend === 'IMPROVING' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Cải thiện
                        </span>
                      ) : l.progress_trend === 'DECLINING' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Giảm sút
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <Minus className="w-3.5 h-3.5" />
                          Ổn định
                        </span>
                      )}
                    </td>

                    {/* Alert status */}
                    <td className="py-3 px-3">
                      {l.alert_status === 'ALERT' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 inline-block whitespace-nowrap">
                          Cần hỗ trợ (Sc: {l.evidence_score})
                        </span>
                      ) : l.alert_status === 'WATCH' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 inline-block whitespace-nowrap">
                          Theo dõi thêm (Sc: {l.evidence_score})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 inline-block whitespace-nowrap">
                          Bình thường
                        </span>
                      )}
                    </td>

                    {/* Teacher Confirmation */}
                    <td className="py-3 px-3">
                      {l.teacher_confirmation === 'CONFIRMED' ? (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Đã xác nhận
                        </span>
                      ) : l.teacher_confirmation === 'WATCHING' ? (
                        <span className="text-[11px] font-semibold text-amber-700">
                          Đang theo dõi
                        </span>
                      ) : l.teacher_confirmation === 'DISMISSED' ? (
                        <span className="text-[11px] font-medium text-slate-500">
                          Đã bác bỏ
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Chưa xem
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectLearner(l.learner_id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors"
                      >
                        Hồ sơ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị{' '}
            <span className="font-semibold text-slate-700">
              {filteredLearners.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, filteredLearners.length)}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold text-slate-700">{filteredLearners.length}</span> người học
          </div>

          <div className="flex items-center gap-1.5 self-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-0.5 font-medium text-slate-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
