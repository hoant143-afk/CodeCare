import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Save,
  CheckCircle2,
  Info,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { ThresholdConfig, LearnerDerived } from '../../types';
import { DEFAULT_THRESHOLDS } from '../../data/seedData';
import { computeAuditMetrics, calculateDerivedLearner } from '../../services/analytics';
import { StorageService } from '../../services/storage';

interface SettingsViewProps {
  thresholds: ThresholdConfig;
  onUpdateThresholds: (newConfig: ThresholdConfig) => void;
  learners: LearnerDerived[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  thresholds,
  onUpdateThresholds,
  learners,
}) => {
  const [form, setForm] = useState<ThresholdConfig>({ ...thresholds });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live simulation with current temporary form state
  const rawList = StorageService.getLearnersRaw();
  const reviews = StorageService.getTeacherReviews();
  const simulatedLearners = rawList.map((r) =>
    calculateDerivedLearner(r, form, reviews[r.learner_id])
  );
  const simulatedMetrics = computeAuditMetrics(simulatedLearners);

  const handleSave = () => {
    onUpdateThresholds(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_THRESHOLDS });
    onUpdateThresholds(DEFAULT_THRESHOLDS);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-800" />
            <span>Cài đặt Ngưỡng & Quy tắc Suy luận Cảnh báo</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tùy biến các tham số trong công thức tính Evidence Score. Hệ thống tính toán lại toàn bộ Dashboard và Báo cáo Audit ngay lập tức.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu ngưỡng</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Đã lưu thành công! Toàn bộ bảng điều khiển và chỉ số Audit đã được tính toán lại theo ngưỡng mới.</span>
        </div>
      )}

      {/* Live impact preview banner */}
      <div className="bg-slate-900 text-white p-4.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mô phỏng tác động trực tiếp của cấu hình hiện tại:</span>
          </span>
          <span className="text-[11px] text-slate-400">Dựa trên 80 người học</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Số cảnh báo sinh ra</span>
            <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
              {simulatedMetrics.totalAlerts} người học
            </span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Độ chuẩn xác (Precision)</span>
            <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
              {(simulatedMetrics.precision * 100).toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Độ bao phủ (Recall)</span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {(simulatedMetrics.recall * 100).toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Độ chính xác (Accuracy)</span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {(simulatedMetrics.accuracy * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Threshold Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Card 1: Ngưỡng kích hoạt Cảnh báo & Theo dõi */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            1. Ngưỡng Điểm Bằng chứng (Evidence Score Thresh)
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Điểm kích hoạt "Có dấu hiệu cần hỗ trợ":
                </label>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  &ge; {form.evidenceAlert} điểm
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={7}
                step={1}
                value={form.evidenceAlert}
                onChange={(e) => setForm({ ...form, evidenceAlert: Number(e.target.value) })}
                className="w-full accent-rose-600"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mặc định: 4 điểm. Tăng lên sẽ giảm số cảnh báo nhưng có thể tăng bỏ sót (giảm Recall).
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Điểm kích hoạt "Theo dõi thêm":
                </label>
                <span className="font-mono font-bold text-amber-700 text-sm">
                  {form.evidenceWatch} điểm
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={form.evidenceAlert - 1}
                step={1}
                value={form.evidenceWatch}
                onChange={(e) => setForm({ ...form, evidenceWatch: Number(e.target.value) })}
                className="w-full accent-amber-600"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mặc định: 3 điểm. Nhóm chưa đến mức can thiệp nhưng cần lưu ý trong giờ lab.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Quy tắc +2 điểm (Tín hiệu mạnh) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            2. Tín hiệu Trọng số Cao (+2 điểm vào Evidence Score)
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Tỷ lệ hoàn thành nhiệm vụ (submission_rate):
                </label>
                <span className="font-mono font-bold text-sky-800 text-sm">
                  &lt; {Math.round(form.submissionRate * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={0.9}
                step={0.05}
                value={form.submissionRate}
                onChange={(e) => setForm({ ...form, submissionRate: Number(e.target.value) })}
                className="w-full accent-sky-700"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mặc định: 70%. Cộng +2 điểm nếu số bài nộp hoàn thành dưới ngưỡng này.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Tỷ lệ vượt qua kiểm thử (test_pass_rate):
                </label>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  &lt; {Math.round(form.testPassRate * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.3}
                max={0.8}
                step={0.05}
                value={form.testPassRate}
                onChange={(e) => setForm({ ...form, testPassRate: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mặc định: 50%. Cộng +2 điểm nếu tỷ lệ test case passed dưới ngưỡng này.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Quy tắc +1 điểm (Tín hiệu bổ sung) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            3. Tín hiệu Bổ sung (+1 điểm vào Evidence Score)
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Số bài nộp trễ hạn tối thiểu:
                </label>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  &ge; {form.lateCount} bài
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={form.lateCount}
                onChange={(e) => setForm({ ...form, lateCount: Number(e.target.value) })}
                className="w-full accent-slate-700"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mặc định: 2 bài. Cộng +1 điểm nếu học sinh có số bài nộp trễ vượt ngưỡng.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Tỷ lệ lỗi trên tổng lần chạy (error_rate):
                </label>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  &gt; {Math.round(form.errorRate * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={0.85}
                step={0.05}
                value={form.errorRate}
                onChange={(e) => setForm({ ...form, errorRate: Number(e.target.value) })}
                className="w-full accent-slate-700"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mặc định: 60%. Cộng +1 điểm nếu tổng lỗi cú pháp + runtime + logic vượt 60% số lần chạy.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Số ngày hoạt động trong tuần (active_days_7d):
                </label>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  &le; {form.activeDays} ngày
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={form.activeDays}
                onChange={(e) => setForm({ ...form, activeDays: Number(e.target.value) })}
                className="w-full accent-slate-700"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mặc định: 2 ngày. Cộng +1 điểm nếu số ngày viết code/đăng nhập trong tuần quá ít.
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Nhận diện Vòng lặp bế tắc */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            4. Nhận diện Vòng lặp Bế tắc / Thử-sai mù quáng
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Ngưỡng số lần chạy mã nhiều:
                </label>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  &ge; {form.highRunThreshold} lần
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                step={1}
                value={form.highRunThreshold}
                onChange={(e) => setForm({ ...form, highRunThreshold: Number(e.target.value) })}
                className="w-full accent-slate-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800">
                  Kết hợp tỷ lệ test case đạt thấp:
                </label>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  &lt; {Math.round(form.lowPassWithHighRun * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={0.6}
                step={0.05}
                value={form.lowPassWithHighRun}
                onChange={(e) => setForm({ ...form, lowPassWithHighRun: Number(e.target.value) })}
                className="w-full accent-slate-700"
              />
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mặc định: Chạy &ge; 15 lần nhưng test pass &lt; 40%. Cộng +1 điểm dấu hiệu bế tắc trong gỡ lỗi.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
