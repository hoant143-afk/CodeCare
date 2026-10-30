import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Eye,
  History,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  Info,
  Calendar,
  Save,
  Clock,
  HeartHandshake,
  MessageSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  LearnerDerived,
  TeacherConfirmation,
  InterventionType,
  InterventionStatus,
} from '../../types';

interface LearnerDetailModalProps {
  learner: LearnerDerived | null;
  onClose: () => void;
  onSaveReview: (
    learnerId: string,
    decision: TeacherConfirmation,
    notes: string,
    intervention?: {
      type: InterventionType;
      status: InterventionStatus;
      date: string;
      outcome: string;
    }
  ) => void;
}

export const LearnerDetailModal: React.FC<LearnerDetailModalProps> = ({
  learner,
  onClose,
  onSaveReview,
}) => {
  if (!learner) return null;

  // Local state for interactive teacher confirmation form
  const [decision, setDecision] = useState<TeacherConfirmation>(
    learner.teacher_confirmation === 'UNREVIEWED' ? 'CONFIRMED' : learner.teacher_confirmation
  );
  const [notes, setNotes] = useState(learner.teacher_notes || '');
  const [interventionType, setInterventionType] = useState<InterventionType>(
    learner.intervention_type || 'Hỗ trợ trực tiếp'
  );
  const [interventionStatus, setInterventionStatus] = useState<InterventionStatus>(
    learner.intervention_status || 'PENDING'
  );
  const [interventionDate, setInterventionDate] = useState<string>(
    learner.intervention_date || new Date().toISOString().split('T')[0]
  );
  const [interventionOutcome, setInterventionOutcome] = useState<string>(
    learner.intervention_outcome || ''
  );
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSave = () => {
    onSaveReview(learner.learner_id, decision, notes, {
      type: interventionType,
      status: decision === 'DISMISSED' ? 'NONE' : interventionStatus,
      date: interventionDate,
      outcome: interventionOutcome,
    });
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  // Prepare chart series from weekly_history
  const chartData = (learner.weekly_history || []).map((h) => ({
    week: `Tuần ${h.week}`,
    testPassRate: Number((h.test_pass_rate * 100).toFixed(1)),
    codeRuns: h.code_runs,
    errors: h.errors,
    submissions: h.assignments_submitted,
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-900 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs">
              {learner.learner_id.replace('STU', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-mono">
                  Hồ sơ học tập: {learner.learner_id}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {learner.class_name}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Tuần hiện tại: {learner.week}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Nhật ký hoạt động hệ thống LMS & Môi trường lập trình (Dữ liệu ẩn danh)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {learner.alert_status === 'ALERT' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Có dấu hiệu cần hỗ trợ (Score: {learner.evidence_score})
              </span>
            )}
            {learner.alert_status === 'WATCH' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                Theo dõi thêm (Score: {learner.evidence_score})
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Top 6 KPI summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Tỷ lệ hoàn thành</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {Math.round(learner.submission_rate * 100)}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {learner.assignments_submitted}/{learner.assignments_due} bài
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Test Pass Rate</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {Math.round(learner.test_pass_rate * 100)}%
              </span>
              <span className="text-[10px] text-slate-500 block">
                {learner.tests_passed}/{learner.total_tests} test
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Số lần chạy code</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {learner.code_runs}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {learner.code_runs >= 15 ? 'Chạy thử nhiều' : 'Mức vừa phải'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Tổng lỗi ghi nhận</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {learner.total_errors}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Cú pháp: {learner.syntax_errors} · Runtime: {learner.runtime_errors}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Mức hoạt động</span>
              <span className="text-lg font-bold text-slate-900">
                {learner.activity_level}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {learner.active_days_7d} ngày / {learner.login_count_7d} login
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Điểm TB lab</span>
              <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                {learner.average_score.toFixed(1)}/10
              </span>
              <span className="text-[10px] text-slate-500 block">
                Xu hướng: {learner.progress_trend === 'IMPROVING' ? 'Tăng' : learner.progress_trend === 'DECLINING' ? 'Giảm' : 'Ổn định'}
              </span>
            </div>
          </div>

          {/* 4 Multi-week historical trend charts */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tiến trình học tập theo thời gian (Tuần 1 đến 6)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chart 1: Test pass rate over time */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  1. Tỷ lệ test case đạt qua các tuần (%)
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#64748b" fontSize={10} />
                      <YAxis unit="%" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Test Pass Rate']}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '6px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="testPassRate"
                        stroke="#0284c7"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Code runs over time */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  2. Số lần chạy mã nguồn qua các tuần
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip
                        formatter={(val: any) => [`${val} lần`, 'Code Runs']}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '6px' }}
                      />
                      <Bar dataKey="codeRuns" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Total errors over time */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  3. Tổng số lỗi gặp phải theo tuần
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip
                        formatter={(val: any) => [`${val} lỗi`, 'Lỗi biên dịch & runtime']}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '6px' }}
                      />
                      <Bar dataKey="errors" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Assignments submitted over time */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="text-xs font-semibold text-slate-800 mb-2">
                  4. Số lượng nhiệm vụ bài nộp hoàn thành
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                      <Tooltip
                        formatter={(val: any) => [`${val} bài nộp`, 'Nhiệm vụ']}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '6px' }}
                      />
                      <Bar dataKey="submissions" fill="#10b981" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Phân tích dấu hiệu & Giải thích cảnh báo */}
          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Tại sao hệ thống đưa ra gợi ý này? (Explainable Alert)</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Điểm bằng chứng (Evidence Score):{' '}
                  <span className="font-mono text-rose-700 font-bold text-sm">
                    {learner.evidence_score} điểm
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Ngưỡng theo dõi: 3 · Ngưỡng cần hỗ trợ: &ge; 4
                </span>
              </div>

              {learner.alert_reasons.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-slate-600">
                    Các chỉ báo kích hoạt điểm bằng chứng:
                  </div>
                  <ul className="space-y-1 pl-1">
                    {learner.alert_reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 text-xs">
                        <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-slate-500 italic py-1">
                  Chưa ghi nhận tín hiệu bất thường. Người học hoàn thành bài nộp và vượt kiểm thử ổn định.
                </div>
              )}
            </div>
          </div>

          {/* Section: Quyết định của giáo viên (Human-in-the-loop) */}
          <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-sky-700" />
                  <span>Quyết định chuyên môn của Giáo viên</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hệ thống KHÔNG tự động chốt quyết định. Giáo viên có quyền quyết định và ghi đè cảnh báo.
                </p>
              </div>

              {learner.confirmation_timestamp && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  Lần lưu gần nhất: {learner.confirmation_timestamp}
                </div>
              )}
            </div>

            {/* 3 Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDecision('CONFIRMED')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  decision === 'CONFIRMED'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Xác nhận cần hỗ trợ</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('WATCHING')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  decision === 'WATCHING'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-400'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>2. Theo dõi thêm</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('DISMISSED')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  decision === 'DISMISSED'
                    ? 'bg-slate-700 text-white border-slate-800 shadow-xs ring-2 ring-slate-400'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
                <span>3. Không cần can thiệp</span>
              </button>
            </div>

            {/* Teacher Notes Input */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Ghi chú chuyên môn của giáo viên:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Đã quan sát học sinh trong buổi thực hành tuần 5, học sinh còn vướng khái niệm con trỏ cấp phát động..."
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-600 text-xs"
              />
            </div>

            {/* Intervention Options (if confirmed or watching) */}
            {decision !== 'DISMISSED' && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <span>Thiết lập kế hoạch can thiệp:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Hình thức can thiệp:</label>
                    <select
                      value={interventionType}
                      onChange={(e) => setInterventionType(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Hỗ trợ trực tiếp">Hỗ trợ trực tiếp (1-on-1)</option>
                      <option value="Gợi ý từng bước">Gợi ý từng bước (Scaffolding)</option>
                      <option value="Giao bài bổ trợ">Giao bài tập bổ trợ nhẹ</option>
                      <option value="Nhắc tiến độ">Nhắc tiến độ & lịch nộp</option>
                      <option value="Theo dõi thêm">Theo dõi thêm phiên tới</option>
                      <option value="Trao đổi cá nhân">Trao đổi cá nhân tìm hiểu nguyên nhân</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Trạng thái can thiệp:</label>
                    <select
                      value={interventionStatus}
                      onChange={(e) => setInterventionStatus(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="PENDING">Chưa thực hiện</option>
                      <option value="IN_PROGRESS">Đang thực hiện</option>
                      <option value="COMPLETED">Hoàn thành</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Ngày thực hiện / hẹn:</label>
                    <input
                      type="date"
                      value={interventionDate}
                      onChange={(e) => setInterventionDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Kết quả sau can thiệp (nếu có):</label>
                  <input
                    type="text"
                    value={interventionOutcome}
                    onChange={(e) => setInterventionOutcome(e.target.value)}
                    placeholder="Ví dụ: Học sinh đã hiểu cú pháp con trỏ, tự hoàn thành test case bài lab 5..."
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* Mandatory Ethics Statement */}
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-sky-900 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-700 shrink-0" />
                <span className="font-semibold">
                  "Đây là cảnh báo hỗ trợ. Quyết định cuối cùng thuộc về giáo viên."
                </span>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu quyết định</span>
              </button>
            </div>

            {showSavedFeedback && (
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium text-center animate-in fade-in">
                Đã cập nhật quyết định của giáo viên và đồng bộ sang danh sách Can thiệp & Nhật ký AI.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Mã bảo mật ẩn danh: {learner.learner_id} (Dự án cuối kỳ CS-AI-Edu)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
