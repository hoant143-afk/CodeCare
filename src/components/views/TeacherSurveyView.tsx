import React, { useState } from 'react';
import {
  FileCheck2,
  Star,
  Send,
  CheckCircle2,
  MessageSquare,
  Users,
  Award,
} from 'lucide-react';
import { TeacherSurveyResponse } from '../../types';
import { StorageService } from '../../services/storage';

export const TeacherSurveyView: React.FC = () => {
  const [surveys, setSurveys] = useState<TeacherSurveyResponse[]>(
    StorageService.getTeacherSurveys()
  );

  // Form states
  const [teacherName, setTeacherName] = useState('TS. Hoàng Minh Trí');
  const [subject, setSubject] = useState('Kiến trúc Máy tính & Hợp ngữ');
  const [q1, setQ1] = useState(5);
  const [q2, setQ2] = useState(5);
  const [q3, setQ3] = useState(5);
  const [q4, setQ4] = useState(4);
  const [q5, setQ5] = useState(5);
  const [q6, setQ6] = useState(5);
  const [q7, setQ7] = useState(5);
  const [mostUseful, setMostUseful] = useState('');
  const [unreasonable, setUnreasonable] = useState('');
  const [neededInfo, setNeededInfo] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSurvey = {
      teacher_name: teacherName || 'Giảng viên đánh giá',
      subject: subject || 'Môn học thực nghiệm',
      q1_easy_to_use: q1,
      q2_indicators_clear: q2,
      q3_reasons_clear: q3,
      q4_helps_identify: q4,
      q5_realistic_interventions: q5,
      q6_no_stigmatization: q6,
      q7_would_use_in_practice: q7,
      most_useful_indicator: mostUseful || 'Tỷ lệ test pass và mức hoạt động',
      unreasonable_alert: unreasonable || 'Không có phản hồi tiêu cực',
      needed_information: neededInfo || 'Đầy đủ cho mức nguyên mẫu',
      suggestions: suggestions || 'Ủng hộ mở rộng triển khai thử nghiệm diện rộng',
    };

    StorageService.addTeacherSurvey(newSurvey);
    setSurveys(StorageService.getTeacherSurveys());
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  // Compute average scores across all surveys
  const n = surveys.length || 1;
  const avgQ1 = (surveys.reduce((s, x) => s + x.q1_easy_to_use, 0) / n).toFixed(2);
  const avgQ2 = (surveys.reduce((s, x) => s + x.q2_indicators_clear, 0) / n).toFixed(2);
  const avgQ3 = (surveys.reduce((s, x) => s + x.q3_reasons_clear, 0) / n).toFixed(2);
  const avgQ4 = (surveys.reduce((s, x) => s + x.q4_helps_identify, 0) / n).toFixed(2);
  const avgQ5 = (surveys.reduce((s, x) => s + x.q5_realistic_interventions, 0) / n).toFixed(2);
  const avgQ6 = (surveys.reduce((s, x) => s + x.q6_no_stigmatization, 0) / n).toFixed(2);
  const avgQ7 = (surveys.reduce((s, x) => s + x.q7_would_use_in_practice, 0) / n).toFixed(2);

  const overallAvg = (
    (Number(avgQ1) +
      Number(avgQ2) +
      Number(avgQ3) +
      Number(avgQ4) +
      Number(avgQ5) +
      Number(avgQ6) +
      Number(avgQ7)) /
    7
  ).toFixed(2);

  const likertQuestions = [
    { id: 'q1', text: '1. Dashboard dễ sử dụng và bố cục thông tin rõ ràng.', val: q1, setVal: setQ1, avg: avgQ1 },
    { id: 'q2', text: '2. Các chỉ báo học tập (submission, test pass, code runs) dễ hiểu và có ý nghĩa sư phạm.', val: q2, setVal: setQ2, avg: avgQ2 },
    { id: 'q3', text: '3. Lý do cảnh báo được giải thích cụ thể, minh bạch (Explainable Alert).', val: q3, setVal: setQ3, avg: avgQ3 },
    { id: 'q4', text: '4. Cảnh báo hỗ trợ tôi nhận biết người học cần hỗ trợ kịp thời hơn.', val: q4, setVal: setQ4, avg: avgQ4 },
    { id: 'q5', text: '5. Các gợi ý can thiệp sư phạm có tính thực tế và khả thi trong giờ học.', val: q5, setVal: setQ5, avg: avgQ5 },
    { id: 'q6', text: '6. Hệ thống không tạo cảm giác gắn nhãn hay kỳ thị người học (không dùng từ yếu/kém).', val: q6, setVal: setQ6, avg: avgQ6 },
    { id: 'q7', text: '7. Tôi có thể cân nhắc sử dụng hệ thống CodeCare trong giảng dạy thực tế.', val: q7, setVal: setQ7, avg: avgQ7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-sky-800" />
          <span>Khảo sát & Đánh giá của Giảng viên về Hệ thống (User Evaluation)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Thu thập phản hồi sư phạm thực tế từ nhóm chuyên gia và giảng viên dạy lập trình về tính hữu dụng, khả năng giải thích và đạo đức AI.
        </p>
      </div>

      {/* Aggregate Score Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Điểm Đánh giá Trung bình Chung (Likert Thang 5)</span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {overallAvg} / 5.00
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Tổng hợp từ {surveys.length} giảng viên tham gia thử nghiệm nguyên mẫu
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Dễ sử dụng</span>
            <span className="font-mono font-bold text-sky-300">{avgQ1}/5</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Giải thích rõ</span>
            <span className="font-mono font-bold text-emerald-300">{avgQ3}/5</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Không kỳ thị</span>
            <span className="font-mono font-bold text-purple-300">{avgQ6}/5</span>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Sẵn sàng dùng</span>
            <span className="font-mono font-bold text-amber-300">{avgQ7}/5</span>
          </div>
        </div>
      </div>

      {submittedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Cảm ơn Thầy/Cô! Phản hồi đánh giá đã được lưu vào hệ thống và cập nhật vào báo cáo.</span>
        </div>
      )}

      {/* Main Grid: Form and Survey Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Đánh giá mới */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Biểu mẫu Đánh giá Dành cho Giảng viên
            </h2>
            <p className="text-xs text-slate-500">
              Chọn mức độ đồng ý từ 1 (Rất không đồng ý) đến 5 (Rất đồng ý)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Họ tên Giảng viên:
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Môn học phụ trách:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>
            </div>

            {/* 7 Likert Questions */}
            <div className="space-y-3 pt-2">
              {likertQuestions.map((q) => (
                <div key={q.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="text-slate-800 font-medium text-xs">{q.text}</div>
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span className="text-[10px]">1 - Rất không đồng ý</span>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <label key={val} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            checked={q.val === val}
                            onChange={() => q.setVal(val)}
                            className="accent-sky-700 cursor-pointer"
                          />
                          <span className="font-mono font-semibold text-slate-800">{val}</span>
                        </label>
                      ))}
                    </div>
                    <span className="text-[10px]">5 - Rất đồng ý</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Open-ended Questions */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                  Chỉ báo nào hữu ích nhất đối với Thầy/Cô?
                </label>
                <input
                  type="text"
                  value={mostUseful}
                  onChange={(e) => setMostUseful(e.target.value)}
                  placeholder="Ví dụ: Tỷ lệ test pass kết hợp số lần chạy code..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                  Cảnh báo nào hệ thống đưa ra còn chưa hợp lý?
                </label>
                <input
                  type="text"
                  value={unreasonable}
                  onChange={(e) => setUnreasonable(e.target.value)}
                  placeholder="Ví dụ: Một số bạn viết code thử nghiệm đồ họa bị gán điểm cao..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                  Đề xuất cải tiến hệ thống:
                </label>
                <textarea
                  rows={2}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="Ý kiến đóng góp phát triển thêm..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi Đánh giá Chuyên môn</span>
            </button>
          </form>
        </div>

        {/* Danh sách các đánh giá đã ghi nhận */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-800" />
              <span>Ý kiến Chuyên môn của Giảng viên ({surveys.length} phiếu)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Lưu trữ minh bạch các phản biện sư phạm để hoàn thiện mô hình can thiệp.
            </p>

            <div className="space-y-3 pt-2">
              {surveys.map((sv) => (
                <div
                  key={sv.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-bold text-slate-900">{sv.teacher_name}</span>
                      <span className="text-[11px] text-slate-500 block">{sv.subject}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        Điểm TB: {(
                          (sv.q1_easy_to_use +
                            sv.q2_indicators_clear +
                            sv.q3_reasons_clear +
                            sv.q4_helps_identify +
                            sv.q5_realistic_interventions +
                            sv.q6_no_stigmatization +
                            sv.q7_would_use_in_practice) /
                          7
                        ).toFixed(1)}/5
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                        {sv.created_at}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-700 text-[11px]">
                    <div>
                      <span className="font-semibold text-slate-800">Chỉ báo hữu ích: </span>
                      {sv.most_useful_indicator}
                    </div>
                    {sv.unreasonable_alert && (
                      <div>
                        <span className="font-semibold text-slate-800">Cảnh báo chưa chuẩn: </span>
                        {sv.unreasonable_alert}
                      </div>
                    )}
                    {sv.suggestions && (
                      <div className="italic text-sky-900 bg-sky-50/60 p-2 rounded border border-sky-100">
                        "{sv.suggestions}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
