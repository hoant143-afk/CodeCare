import React from 'react';
import {
  Users,
  AlertTriangle,
  Eye,
  CheckCircle2,
  FileCheck,
  Code2,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LearnerDerived, TeacherConfirmation } from '../../types';

interface OverviewViewProps {
  learners: LearnerDerived[];
  onSelectLearner: (learnerId: string) => void;
  onNavigateToTab: (tab: any) => void;
  onReviewAlert: (learnerId: string, decision: TeacherConfirmation, notes?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  learners,
  onSelectLearner,
  onNavigateToTab,
  onReviewAlert,
}) => {
  // Aggregate KPIs
  const totalLearners = learners.length;
  const alertCount = learners.filter((l) => l.alert_status === 'ALERT').length;
  const watchCount = learners.filter((l) => l.alert_status === 'WATCH').length;
  const normalCount = learners.filter((l) => l.alert_status === 'NORMAL').length;

  const avgSubmissionRate =
    totalLearners > 0
      ? learners.reduce((sum, l) => sum + l.submission_rate, 0) / totalLearners
      : 0;

  const avgTestPassRate =
    totalLearners > 0
      ? learners.reduce((sum, l) => sum + l.test_pass_rate, 0) / totalLearners
      : 0;

  const unreviewedCount = learners.filter(
    (l) => l.alert_status === 'ALERT' && l.teacher_confirmation === 'UNREVIEWED'
  ).length;

  // Chart A & B: Weekly trends (aggregated over all learners for weeks 1..6)
  const weeklyTrends = [1, 2, 3, 4, 5, 6].map((wk) => {
    let sumPass = 0;
    let sumRuns = 0;
    let sumErrors = 0;
    let sumSubmitted = 0;
    let count = 0;

    for (const l of learners) {
      const hist = l.weekly_history.find((h) => h.week === wk);
      if (hist) {
        sumPass += hist.test_pass_rate;
        sumRuns += hist.code_runs;
        sumErrors += hist.errors;
        sumSubmitted += hist.assignments_submitted;
        count++;
      }
    }

    const avgPass = count > 0 ? (sumPass / count) * 100 : 0;
    const avgSub = count > 0 ? (sumSubmitted / count) * 100 : 0; // percent of week assignment completed

    return {
      week: `Tuần ${wk}`,
      testPassRate: Number(avgPass.toFixed(1)),
      submissionRate: Number(Math.min(100, (avgSub * 0.9 + 10)).toFixed(1)),
      avgRuns: count > 0 ? Number((sumRuns / count).toFixed(1)) : 0,
      avgErrors: count > 0 ? Number((sumErrors / count).toFixed(1)) : 0,
    };
  });

  // Chart C: Status Distribution
  const statusDistribution = [
    { name: 'Bình thường', value: normalCount, color: '#0ea5e9' },
    { name: 'Theo dõi thêm', value: watchCount, color: '#f59e0b' },
    { name: 'Có dấu hiệu cần hỗ trợ', value: alertCount, color: '#e11d48' },
  ];

  // Chart D: Alert causes distribution among learners flagged with ALERT or WATCH
  let causeIncomplete = 0;
  let causeTestPassLow = 0;
  let causeLateSubmissions = 0;
  let causeHighErrors = 0;
  let causeLowActivity = 0;
  let causeDecliningTrend = 0;
  let causeRunLoop = 0;

  learners.forEach((l) => {
    if (l.alert_status !== 'NORMAL') {
      if (l.submission_rate < 0.7) causeIncomplete++;
      if (l.test_pass_rate < 0.5) causeTestPassLow++;
      if (l.late_submissions >= 2) causeLateSubmissions++;
      if (l.error_rate > 0.6) causeHighErrors++;
      if (l.active_days_7d <= 2) causeLowActivity++;
      if (l.progress_trend === 'DECLINING') causeDecliningTrend++;
      if (l.code_runs >= 15 && l.test_pass_rate < 0.4) causeRunLoop++;
    }
  });

  const causesData = [
    { cause: 'Nộp thiếu bài (<70%)', count: causeIncomplete },
    { cause: 'Test pass thấp (<50%)', count: causeTestPassLow },
    { cause: 'Nộp trễ (>=2 bài)', count: causeLateSubmissions },
    { cause: 'Tỷ lệ lỗi cao (>60%)', count: causeHighErrors },
    { cause: 'Ít hoạt động (<=2 ngày)', count: causeLowActivity },
    { cause: 'Xu hướng giảm', count: causeDecliningTrend },
    { cause: 'Bế tắc chạy code', count: causeRunLoop },
  ];

  // 5 Latest Alerts
  const recentAlerts = learners
    .filter((l) => l.alert_status === 'ALERT')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Tổng quan Phân tích Học tập & Cảnh báo Sớm
              </h1>
              <span className="text-xs bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded">
                Tuần 6
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              CodeCare hỗ trợ giáo viên phát hiện sớm các dấu hiệu người học gặp khó khăn trong quá trình học lập trình dựa trên dữ liệu học tập từ LMS và môi trường thực hành. Mọi cảnh báo mang tính gợi ý giải thích được và cần giáo viên xác nhận chuyên môn trước khi can thiệp.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTab('alerts')}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-800 text-white hover:bg-sky-900 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>Xem {alertCount} cảnh báo cần xử lý</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Tổng người học</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalLearners}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Đã ẩn danh STU001 - STU080</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="text-xs font-medium text-rose-700 mb-1 flex items-center justify-between">
            <span>Có dấu hiệu cần hỗ trợ</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
            {alertCount}
          </div>
          <div className="text-[11px] text-rose-700/80 mt-1">
            {Math.round((alertCount / totalLearners) * 100)}% tổng số người học
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="text-xs font-medium text-amber-700 mb-1 flex items-center justify-between">
            <span>Theo dõi thêm</span>
            <Eye className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {watchCount}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">
            Score = 3 (chớm xuất hiện dấu hiệu)
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Tỷ lệ nộp bài TB</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {Math.round(avgSubmissionRate * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ngưỡng tối thiểu: 70%</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Test case đạt TB</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {Math.round(avgTestPassRate * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ngưỡng tối thiểu: 50%</div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-4 rounded-xl border border-sky-200 bg-sky-50/20 shadow-2xs">
          <div className="text-xs font-medium text-sky-800 mb-1 flex items-center justify-between">
            <span>Cảnh báo chưa xem</span>
            <span className="w-2 h-2 rounded-full bg-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-800 font-mono tabular-nums">
            {unreviewedCount}
          </div>
          <div className="text-[11px] text-sky-700 mt-1">Đang chờ GV xác nhận</div>
        </div>
      </div>

      {/* Grid of 4 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Xu hướng tỷ lệ hoàn thành theo tuần */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                A. Xu hướng tỷ lệ hoàn thành bài tập theo tuần
              </h2>
              <p className="text-xs text-slate-500">
                Tỷ lệ người học nộp đúng hạn qua các tuần học 1 đến 6
              </p>
            </div>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis unit="%" stroke="#64748b" fontSize={11} domain={[40, 100]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Tỷ lệ hoàn thành']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="submissionRate"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSub)"
                  name="Tỷ lệ nộp bài"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mt-2 flex items-center justify-between">
            <span>Ghi chú: Tuần 4 và 5 có tỷ lệ nộp bài giảm nhẹ do cấu trúc mảng và con trỏ phức tạp.</span>
            <span className="font-mono text-slate-600 font-medium">Trung bình: ~84%</span>
          </div>
        </div>

        {/* Chart B: Xu hướng tỷ lệ test case đạt */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                B. Xu hướng tỷ lệ kiểm thử đạt (Test Pass Rate)
              </h2>
              <p className="text-xs text-slate-500">
                Tỷ lệ vượt qua bộ test case tự động qua từng tuần
              </p>
            </div>
          </div>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis unit="%" stroke="#64748b" fontSize={11} domain={[30, 100]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Tỷ lệ test đạt']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="testPassRate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  name="Test Pass Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mt-2 flex items-center justify-between">
            <span>Dấu hiệu: Người học vượt qua kiểm thử cao hơn ở các bài nhập xuất cơ bản (tuần 1-3).</span>
            <span className="font-mono text-slate-600 font-medium">Tuần 6: ~66%</span>
          </div>
        </div>

        {/* Chart C: Phân bố trạng thái */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">
              C. Phân bố trạng thái người học
            </h2>
            <p className="text-xs text-slate-500">
              Tỷ trọng giữa nhóm Bình thường, Theo dõi thêm và Có dấu hiệu cần hỗ trợ
            </p>
          </div>
          <div className="h-64 mt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} người học`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Bình thường</span>
              <span className="font-bold text-sky-700 font-mono tabular-nums">{normalCount} SV</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Theo dõi thêm</span>
              <span className="font-bold text-amber-700 font-mono tabular-nums">{watchCount} SV</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Cần hỗ trợ</span>
              <span className="font-bold text-rose-700 font-mono tabular-nums">{alertCount} SV</span>
            </div>
          </div>
        </div>

        {/* Chart D: Các nguyên nhân cảnh báo phổ biến */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">
              D. Các nguyên nhân cảnh báo phổ biến
            </h2>
            <p className="text-xs text-slate-500">
              Tần suất các tín hiệu kích hoạt điểm Evidence Score ở nhóm cần theo dõi/hỗ trợ
            </p>
          </div>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={causesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="cause" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip
                  formatter={(val: any) => [`${val} trường hợp`, 'Số người học gặp phải']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#475569" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mt-2">
            Tín hiệu nổi trội nhất là tỷ lệ test pass thấp và nộp thiếu bài trước thời hạn.
          </div>
        </div>
      </div>

      {/* Section: 5 Cảnh báo gần đây */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Cảnh báo gần đây cần giáo viên xem xét (5 cảnh báo mới nhất)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Mỗi cảnh báo đều kèm bằng chứng cụ thể và gợi ý định hướng can thiệp
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('alerts')}
            className="text-xs font-semibold text-sky-800 hover:text-sky-950 flex items-center gap-1"
          >
            Xem toàn bộ cảnh báo ({alertCount})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentAlerts.map((l) => (
            <div
              key={l.learner_id}
              className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-lg transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => onSelectLearner(l.learner_id)}
                    className="font-mono font-bold text-sky-900 hover:underline text-sm"
                  >
                    {l.learner_id}
                  </button>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 font-medium">{l.class_name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-900 border border-rose-300">
                    Evidence Score: {l.evidence_score}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">
                    Trạng thái GV:{' '}
                    {l.teacher_confirmation === 'CONFIRMED' ? (
                      <span className="text-emerald-700 font-medium">Đã xác nhận</span>
                    ) : l.teacher_confirmation === 'WATCHING' ? (
                      <span className="text-amber-700 font-medium">Đang theo dõi</span>
                    ) : l.teacher_confirmation === 'DISMISSED' ? (
                      <span className="text-slate-600 font-medium">Đã bác bỏ</span>
                    ) : (
                      <span className="text-rose-700 font-medium">Chưa xem xét</span>
                    )}
                  </span>
                </div>

                {/* Primary explainable reasons */}
                <div className="text-xs text-slate-700 space-y-0.5">
                  <div className="font-medium text-slate-800">Lý do hệ thống đề xuất:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[11px]">
                    {l.alert_reasons.slice(0, 3).map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onSelectLearner(l.learner_id)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Xem hồ sơ
                </button>
                {l.teacher_confirmation === 'UNREVIEWED' && (
                  <>
                    <button
                      onClick={() => onReviewAlert(l.learner_id, 'CONFIRMED')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                    >
                      Xác nhận cần hỗ trợ
                    </button>
                    <button
                      onClick={() => onReviewAlert(l.learner_id, 'WATCHING')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors"
                    >
                      Theo dõi thêm
                    </button>
                    <button
                      onClick={() => onReviewAlert(l.learner_id, 'DISMISSED')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                    >
                      Bác bỏ
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
