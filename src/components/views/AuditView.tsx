import React from 'react';
import {
  ShieldCheck,
  Scale,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Info,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { LearnerDerived, ThresholdConfig } from '../../types';
import {
  computeAuditMetrics,
  simulateThresholds,
  computeFairnessAudit,
} from '../../services/analytics';
import { StorageService } from '../../services/storage';
import { exportAuditReportToJSON } from '../../services/exportService';

interface AuditViewProps {
  learners: LearnerDerived[];
  thresholds: ThresholdConfig;
  onSelectLearner: (learnerId: string) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  learners,
  thresholds,
  onSelectLearner,
}) => {
  // Compute current metrics
  const metrics = computeAuditMetrics(learners);
  const rawList = StorageService.getLearnersRaw();
  const reviews = StorageService.getTeacherReviews();
  const thresholdPoints = simulateThresholds(rawList, thresholds, reviews);
  const fairness = computeFairnessAudit(learners);

  // False Positives (System ALERT, Ground Truth NORMAL)
  const falsePositives = learners.filter(
    (l) => l.alert_status === 'ALERT' && l.teacher_label === 'NORMAL'
  );

  // False Negatives (System NOT ALERT, Ground Truth NEED_SUPPORT)
  const falseNegatives = learners.filter(
    (l) => l.alert_status !== 'ALERT' && l.teacher_label === 'NEED_SUPPORT'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-800" />
                <span>Báo cáo Audit Mô hình & Đánh giá Sư phạm</span>
              </h1>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Kiểm định độc lập
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Đánh giá chất lượng của thuật toán suy luận Evidence-based Alert so với nhãn chuẩn chuyên môn của giảng viên (Teacher Ground Truth). Phân tích toàn diện Ma trận nhầm lẫn (Confusion Matrix), Độ chuẩn xác, Độ bao phủ, các trường hợp sai số và tính công bằng giữa các phân nhóm.
            </p>
          </div>

          <button
            onClick={() => exportAuditReportToJSON(metrics, thresholdPoints, fairness, learners.length)}
            className="px-3.5 py-2 rounded-lg bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 self-start md:self-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Xuất Báo cáo Audit (JSON)</span>
          </button>
        </div>
      </div>

      {/* 4 Core Quantitative Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Precision */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Độ chuẩn xác (Precision)</span>
            <span className="text-[10px] bg-sky-50 text-sky-800 font-mono px-1.5 py-0.5 rounded border border-sky-200">
              TP / (TP + FP)
            </span>
          </div>
          <div className="text-3xl font-bold text-sky-900 font-mono tabular-nums">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 leading-snug">
            Trong các cảnh báo của hệ thống, có bao nhiêu cảnh báo thực sự đúng với nhận định giáo viên.
          </div>
        </div>

        {/* Recall */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Độ bao phủ (Recall)</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-1.5 py-0.5 rounded border border-emerald-200">
              TP / (TP + FN)
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-700 font-mono tabular-nums">
            {(metrics.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 leading-snug">
            Trong số người học thực sự cần hỗ trợ, hệ thống đã phát hiện được bao nhiêu người học.
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Độ chính xác (Accuracy)</span>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded border border-slate-200">
              (TP + TN) / Tổng
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-800 font-mono tabular-nums">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 leading-snug">
            Tỷ lệ quyết định đúng trên toàn bộ {learners.length} học sinh (cả bình thường và cần hỗ trợ).
          </div>
        </div>

        {/* Actionable Alert Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Tỷ lệ có hành động</span>
            <span className="text-[10px] bg-purple-50 text-purple-800 font-mono px-1.5 py-0.5 rounded border border-purple-200">
              Can thiệp / Cảnh báo
            </span>
          </div>
          <div className="text-3xl font-bold text-purple-800 font-mono tabular-nums">
            {(metrics.actionableRate * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 leading-snug">
            Tỷ lệ cảnh báo thực tế được giáo viên chuyển hóa thành kế hoạch can thiệp cụ thể.
          </div>
        </div>
      </div>

      {/* 2x2 Confusion Matrix & Pedagogical Formulas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Ma trận Nhầm lẫn (Confusion Matrix 2×2)
              </h2>
              <p className="text-xs text-slate-500">
                So sánh Dự đoán của Hệ thống với Đánh giá Thực tế của Giảng viên
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              N = {learners.length} SV
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  <th colSpan={2} rowSpan={2} className="p-2 border border-slate-200 bg-slate-50 text-slate-500 font-normal">
                    <span className="font-semibold text-slate-700">Ma trận 2x2</span>
                  </th>
                  <th colSpan={2} className="p-2 border border-slate-200 bg-slate-100 font-bold text-slate-800">
                    Thực tế Giảng viên (Ground Truth)
                  </th>
                </tr>
                <tr>
                  <th className="p-2 border border-slate-200 bg-rose-50 text-rose-900 font-semibold w-1/3">
                    CẦN HỖ TRỢ (Positive)
                  </th>
                  <th className="p-2 border border-slate-200 bg-slate-50 text-slate-700 font-semibold w-1/3">
                    BÌNH THƯỜNG (Negative)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th rowSpan={2} className="p-2 border border-slate-200 bg-slate-100 font-bold text-slate-800 w-16 write-vertical sm:write-horizontal">
                    Hệ thống dự đoán
                  </th>
                  <th className="p-2.5 border border-slate-200 bg-rose-50/70 text-rose-900 font-semibold text-left">
                    CẢNH BÁO (&ge; {thresholds.evidenceAlert}đ)
                  </th>
                  {/* TP */}
                  <td className="p-3 border border-slate-200 bg-emerald-50/70 text-emerald-950 font-bold">
                    <div className="text-xl font-mono tabular-nums">{metrics.tp}</div>
                    <div className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
                      Đúng dương (TP)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Phát hiện đúng SV cần hỗ trợ</div>
                  </td>
                  {/* FP */}
                  <td className="p-3 border border-slate-200 bg-amber-50/60 text-amber-950 font-bold">
                    <div className="text-xl font-mono tabular-nums">{metrics.fp}</div>
                    <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
                      Sai dương (FP)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Cảnh báo nhầm SV bình thường</div>
                  </td>
                </tr>

                <tr>
                  <th className="p-2.5 border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-left">
                    KHÔNG CẢNH BÁO
                  </th>
                  {/* FN */}
                  <td className="p-3 border border-slate-200 bg-rose-50/60 text-rose-950 font-bold">
                    <div className="text-xl font-mono tabular-nums">{metrics.fn}</div>
                    <div className="text-[10px] text-rose-800 font-semibold uppercase tracking-wider">
                      Sai âm (FN)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Bỏ sót SV thực sự cần hỗ trợ</div>
                  </td>
                  {/* TN */}
                  <td className="p-3 border border-slate-200 bg-sky-50/60 text-sky-950 font-bold">
                    <div className="text-xl font-mono tabular-nums">{metrics.tn}</div>
                    <div className="text-[10px] text-sky-800 font-semibold uppercase tracking-wider">
                      Đúng âm (TN)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Xác định đúng SV học ổn định</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 leading-relaxed">
            * Mục tiêu sư phạm: Tối đa hóa <span className="font-semibold text-slate-700">Recall</span> để không bỏ sót người học nguy cơ, đồng thời kiểm soát <span className="font-semibold text-slate-700">Precision</span> để tránh gây mệt mỏi cảnh báo (Alert Fatigue) cho giáo viên.
          </div>
        </div>

        {/* Multi-Threshold Simulation Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Đánh đổi Precision & Recall theo Ngưỡng Evidence Score
              </h2>
              <p className="text-xs text-slate-500">
                Mô phỏng hiệu năng hệ thống khi thay đổi ngưỡng kích hoạt cảnh báo từ 3 đến 6
              </p>
            </div>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={thresholdPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="threshold"
                  stroke="#64748b"
                  fontSize={11}
                  label={{ value: 'Ngưỡng Evidence Score', position: 'insideBottom', offset: -5, fontSize: 10 }}
                />
                <YAxis unit="%" stroke="#64748b" fontSize={11} domain={[40, 100]} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '6px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="precision"
                  stroke="#0284c7"
                  name="Precision (%)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="recall"
                  stroke="#10b981"
                  name="Recall (%)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table of simulation */}
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-center text-xs border border-slate-200 rounded">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-1.5">Ngưỡng</th>
                  <th className="p-1.5">Số cảnh báo</th>
                  <th className="p-1.5 text-emerald-800">TP</th>
                  <th className="p-1.5 text-amber-800">FP</th>
                  <th className="p-1.5 text-sky-800">TN</th>
                  <th className="p-1.5 text-rose-800">FN</th>
                  <th className="p-1.5">Precision</th>
                  <th className="p-1.5">Recall</th>
                  <th className="p-1.5">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {thresholdPoints.map((pt) => (
                  <tr
                    key={pt.threshold}
                    className={pt.threshold === thresholds.evidenceAlert ? 'bg-sky-50/80 font-bold text-sky-950' : 'text-slate-700'}
                  >
                    <td className="p-1.5">Score &ge; {pt.threshold} {pt.threshold === thresholds.evidenceAlert && '(Hiện tại)'}</td>
                    <td className="p-1.5">{pt.alertCount} SV</td>
                    <td className="p-1.5 font-bold text-emerald-700">{pt.tp}</td>
                    <td className="p-1.5 font-bold text-amber-700">{pt.fp}</td>
                    <td className="p-1.5 font-bold text-sky-700">{pt.tn}</td>
                    <td className="p-1.5 font-bold text-rose-700">{pt.fn}</td>
                    <td className="p-1.5 font-semibold text-sky-900">{pt.precision}%</td>
                    <td className="p-1.5 font-semibold text-emerald-800">{pt.recall}%</td>
                    <td className="p-1.5">{pt.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deep Dive Section: Phân tích Sai dương & Sai âm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phân tích Sai Dương (False Positives) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Phân tích Cảnh báo Sai Dương (False Positives - {falsePositives.length} trường hợp)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Hệ thống phát tín hiệu cảnh báo nhưng thực tế người học vẫn học tập bình thường.
          </p>

          <div className="space-y-3">
            {falsePositives.map((fp) => (
              <div
                key={fp.learner_id}
                className="p-3 bg-amber-50/40 border border-amber-200 rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSelectLearner(fp.learner_id)}
                    className="font-mono font-bold text-sky-900 hover:underline"
                  >
                    {fp.learner_id} ({fp.class_name})
                  </button>
                  <span className="font-mono text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                    Score: {fp.evidence_score}đ
                  </span>
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold">Nguyên nhân hệ thống hiểu nhầm: </span>
                  {fp.learner_id === 'STU015'
                    ? 'Học sinh chủ động viết module đồ họa/game 3D ngoài bài tập bắt buộc, chạy thử mã 28 lần với nhiều lỗi thử nghiệm, khiến tỷ lệ lỗi tăng cao và nộp bài môn chung trễ 2 lần.'
                    : fp.learner_id === 'STU069'
                    ? 'Học sinh có thói quen gỡ lỗi bằng cách chạy code liên tục thay vì dùng debugger, tỷ lệ test pass tạm thời giảm nhưng học sinh tự hoàn thiện rất nhanh.'
                    : 'Học sinh thử nghiệm nhiều kỹ thuật nâng cao gây nhiễu tín hiệu tần suất chạy mã.'}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  * Ý nghĩa: Giáo viên dùng nút "Không cần can thiệp" để ghi đè mà không ảnh hưởng tiêu cực tới học sinh.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phân tích Sai Âm (False Negatives) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Phân tích Bỏ sót Sai Âm (False Negatives - {falseNegatives.length} trường hợp)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Học sinh thực sự gặp khó khăn trong học tập nhưng hệ thống không đưa ra cảnh báo.
          </p>

          <div className="space-y-3">
            {falseNegatives.map((fn) => (
              <div
                key={fn.learner_id}
                className="p-3 bg-rose-50/40 border border-rose-200 rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSelectLearner(fn.learner_id)}
                    className="font-mono font-bold text-sky-900 hover:underline"
                  >
                    {fn.learner_id} ({fn.class_name})
                  </button>
                  <span className="font-mono text-rose-800 font-semibold bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                    Score: {fn.evidence_score}đ (Dưới ngưỡng)
                  </span>
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold">Tín hiệu hệ thống bỏ sót: </span>
                  {fn.learner_id === 'STU048'
                    ? 'Học sinh nộp bài đầy đủ 100% và test pass 79% trên hệ thống LMS, nhưng trên lớp thực hành giáo viên quan sát thấy học sinh hoàn toàn phụ thuộc vào bạn cùng bàn hoặc chép code có sẵn.'
                    : fn.learner_id === 'STU074'
                    ? 'Các chỉ số nộp bài và chạy mã đều ở mức trung bình, nhưng trong bài thi tự luận tại lớp học sinh lộ rõ lỗ hổng lớn về mô hình bộ nhớ con trỏ.'
                    : 'Các tín hiệu tương tác trực tiếp ngoài không gian số LMS mà hệ thống không có quyền truy cập.'}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  * Ý nghĩa: Khẳng định AI chỉ là công cụ bổ trợ, không thể thay thế sự quan sát sư phạm trực tiếp của thầy cô.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Công bằng theo nhóm trung tính (Neutral Subgroups Fairness Audit) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-800" />
              <span>Kiểm định Tính Công bằng theo Phân nhóm Trung tính (Fairness Audit)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Không sử dụng bất kỳ thuộc tính nhạy cảm cá nhân nào. Đánh giá tính nhất quán của mô hình giữa các lớp học và điều kiện kỹ thuật.
            </p>
          </div>
        </div>

        {/* 3 Fairness Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          {/* By Class */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/40 space-y-2">
            <h3 className="font-bold text-slate-800">1. Theo Phân nhóm Lớp học</h3>
            <table className="w-full text-center border-collapse">
              <thead className="text-[11px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-1 text-left">Nhóm</th>
                  <th className="p-1">SL</th>
                  <th className="p-1">Prec</th>
                  <th className="p-1">Recall</th>
                  <th className="p-1">FPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {fairness.byClass.map((g) => (
                  <tr key={g.groupName}>
                    <td className="p-1 text-left font-sans font-medium text-slate-700">{g.groupName.split(' ')[0]} {g.groupName.split(' ')[1]}</td>
                    <td className="p-1">{g.count}</td>
                    <td className="p-1 font-semibold text-sky-800">{(g.precision * 100).toFixed(0)}%</td>
                    <td className="p-1 font-semibold text-emerald-700">{(g.recall * 100).toFixed(0)}%</td>
                    <td className="p-1 text-amber-700">{(g.fpr * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* By Activity Level */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/40 space-y-2">
            <h3 className="font-bold text-slate-800">2. Theo Mức độ Hoạt động</h3>
            <table className="w-full text-center border-collapse">
              <thead className="text-[11px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-1 text-left">Nhóm</th>
                  <th className="p-1">SL</th>
                  <th className="p-1">Prec</th>
                  <th className="p-1">Recall</th>
                  <th className="p-1">FPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {fairness.byActivity.map((g) => (
                  <tr key={g.groupName}>
                    <td className="p-1 text-left font-sans font-medium text-slate-700">
                      {g.groupName}
                      {g.count < 10 && (
                        <span className="ml-1 text-[9px] text-amber-800 bg-amber-100/90 px-1 py-0.2 rounded font-normal" title="Mẫu nhỏ N < 10">
                          N&lt;10
                        </span>
                      )}
                    </td>
                    <td className="p-1">{g.count}</td>
                    <td className="p-1 font-semibold text-sky-800">{(g.precision * 100).toFixed(0)}%</td>
                    <td className="p-1 font-semibold text-emerald-700">{(g.recall * 100).toFixed(0)}%</td>
                    <td className="p-1 text-amber-700">{(g.fpr * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* By Data Completeness */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/40 space-y-2">
            <h3 className="font-bold text-slate-800">3. Theo Tính Đầy đủ Dữ liệu</h3>
            <table className="w-full text-center border-collapse">
              <thead className="text-[11px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-1 text-left">Nhóm</th>
                  <th className="p-1">SL</th>
                  <th className="p-1">Prec</th>
                  <th className="p-1">Recall</th>
                  <th className="p-1">FPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {fairness.byCompleteness.map((g) => (
                  <tr key={g.groupName}>
                    <td className="p-1 text-left font-sans font-medium text-slate-700">
                      {g.groupName.split(' ')[0]} {g.groupName.split(' ')[1]}
                      {g.count < 10 && (
                        <span className="ml-1 text-[9px] text-amber-800 bg-amber-100/90 px-1 py-0.2 rounded font-normal" title="Mẫu nhỏ N < 10">
                          N&lt;10
                        </span>
                      )}
                    </td>
                    <td className="p-1">{g.count}</td>
                    <td className="p-1 font-semibold text-sky-800">{(g.precision * 100).toFixed(0)}%</td>
                    <td className="p-1 font-semibold text-emerald-700">{(g.recall * 100).toFixed(0)}%</td>
                    <td className="p-1 text-amber-700">{(g.fpr * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mandatory Ethical Fairness Note */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            "Sự khác biệt giữa các nhóm không tự động chứng minh hệ thống thiên lệch. Giáo viên cần xem xét nguyên nhân dữ liệu và bối cảnh thực tế của từng nhóm người học."
          </p>
        </div>
      </div>
    </div>
  );
};
