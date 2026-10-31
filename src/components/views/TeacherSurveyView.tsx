import React, { useState } from 'react';
import {
  FileCheck2,
  Send,
  CheckCircle2,
  Users,
  Award,
  Download,
  Info,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { TeacherSurveyResponse } from '../../types';
import { StorageService } from '../../services/storage';
import { exportSurveysToCSV } from '../../services/exportService';

export const TeacherSurveyView: React.FC = () => {
  const [surveys, setSurveys] = useState<TeacherSurveyResponse[]>(() =>
    StorageService.getTeacherSurveys()
  );

  // Form states: hoàn toàn trống, không điền sẵn danh tính hoặc câu trả lời tích cực
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('');
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [q3, setQ3] = useState(0);
  const [q4, setQ4] = useState(0);
  const [q5, setQ5] = useState(0);
  const [q6, setQ6] = useState(0);
  const [q7, setQ7] = useState(0);
  const [mostUseful, setMostUseful] = useState('');
  const [unreasonable, setUnreasonable] = useState('');
  const [neededInfo, setNeededInfo] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!teacherName.trim()) {
      setFormError('Vui lòng nhập họ tên hoặc chức danh giảng viên đánh giá.');
      return;
    }

    if (!subject.trim()) {
      setFormError('Vui lòng nhập môn học phụ trách.');
      return;
    }

    if (q1 === 0 || q2 === 0 || q3 === 0 || q4 === 0 || q5 === 0 || q6 === 0 || q7 === 0) {
      setFormError('Vui lòng hoàn thành đầy đủ cả 7 câu hỏi thang đo Likert (từ 1 đến 5).');
      return;
    }

    // Không tự động điền thêm nhận xét tích cực khi người dùng để trống
    const newSurvey: Omit<TeacherSurveyResponse, 'id' | 'created_at'> = {
      teacher_name: teacherName.trim(),
      subject: subject.trim(),
      q1_easy_to_use: q1,
      q2_indicators_clear: q2,
      q3_reasons_clear: q3,
      q4_helps_identify: q4,
      q5_realistic_interventions: q5,
      q6_no_stigmatization: q6,
      q7_would_use_in_practice: q7,
      most_useful_indicator: mostUseful.trim(),
      unreasonable_alert: unreasonable.trim(),
      needed_information: neededInfo.trim(),
      suggestions: suggestions.trim(),
      is_sample: false,
    };

    StorageService.addTeacherSurvey(newSurvey);
    setSurveys(StorageService.getTeacherSurveys());
    setSubmittedSuccess(true);

    // Reset form fields
    setTeacherName('');
    setSubject('');
    setQ1(0);
    setQ2(0);
    setQ3(0);
    setQ4(0);
    setQ5(0);
    setQ6(0);
    setQ7(0);
    setMostUseful('');
    setUnreasonable('');
    setNeededInfo('');
    setSuggestions('');

    setTimeout(() => setSubmittedSuccess(false), 4500);
  };

  const handleExportCSV = () => {
    exportSurveysToCSV(surveys);
  };

  // Phân tách hoàn toàn khảo sát thực tế và khảo sát mẫu
  const realSurveys = surveys.filter((s) => !s.is_sample);
  const sampleSurveys = surveys.filter((s) => s.is_sample);
  const realCount = realSurveys.length;
  const sampleCount = sampleSurveys.length;

  // Tính điểm trung bình CHỈ cho khảo sát thực tế (loại trừ phiếu mẫu)
  const calcAverages = (items: TeacherSurveyResponse[]) => {
    if (items.length === 0) return null;
    const n = items.length;
    const avgQ1 = (items.reduce((s, x) => s + x.q1_easy_to_use, 0) / n).toFixed(2);
    const avgQ2 = (items.reduce((s, x) => s + x.q2_indicators_clear, 0) / n).toFixed(2);
    const avgQ3 = (items.reduce((s, x) => s + x.q3_reasons_clear, 0) / n).toFixed(2);
    const avgQ4 = (items.reduce((s, x) => s + x.q4_helps_identify, 0) / n).toFixed(2);
    const avgQ5 = (items.reduce((s, x) => s + x.q5_realistic_interventions, 0) / n).toFixed(2);
    const avgQ6 = (items.reduce((s, x) => s + x.q6_no_stigmatization, 0) / n).toFixed(2);
    const avgQ7 = (items.reduce((s, x) => s + x.q7_would_use_in_practice, 0) / n).toFixed(2);
    const overall = (
      (Number(avgQ1) +
        Number(avgQ2) +
        Number(avgQ3) +
        Number(avgQ4) +
        Number(avgQ5) +
        Number(avgQ6) +
        Number(avgQ7)) /
      7
    ).toFixed(2);

    return { avgQ1, avgQ2, avgQ3, avgQ4, avgQ5, avgQ6, avgQ7, overall };
  };

  const realMetrics = calcAverages(realSurveys);
  const sampleMetrics = calcAverages(sampleSurveys);

  const likertQuestions = [
    { id: 'q1', text: '1. Dashboard dễ sử dụng và bố cục thông tin rõ ràng.', val: q1, setVal: setQ1, avgReal: realMetrics?.avgQ1 },
    { id: 'q2', text: '2. Các chỉ báo học tập (submission, test pass, code runs) dễ hiểu và có ý nghĩa sư phạm.', val: q2, setVal: setQ2, avgReal: realMetrics?.avgQ2 },
    { id: 'q3', text: '3. Lý do cảnh báo được giải thích cụ thể, minh bạch (Explainable Alert).', val: q3, setVal: setQ3, avgReal: realMetrics?.avgQ3 },
    { id: 'q4', text: '4. Cảnh báo hỗ trợ tôi nhận biết người học cần hỗ trợ kịp thời hơn.', val: q4, setVal: setQ4, avgReal: realMetrics?.avgQ4 },
    { id: 'q5', text: '5. Các gợi ý can thiệp sư phạm có tính thực tế và khả thi trong giờ học.', val: q5, setVal: setQ5, avgReal: realMetrics?.avgQ5 },
    { id: 'q6', text: '6. Hệ thống không tạo cảm giác gắn nhãn hay kỳ thị người học (không dùng từ yếu/kém).', val: q6, setVal: setQ6, avgReal: realMetrics?.avgQ6 },
    { id: 'q7', text: '7. Tôi có thể cân nhắc sử dụng hệ thống CodeCare trong giảng dạy thực tế.', val: q7, setVal: setQ7, avgReal: realMetrics?.avgQ7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-sky-800" />
            <span>Khảo sát & Đánh giá của Giảng viên về Hệ thống (User Evaluation)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thu thập phản hồi sư phạm thực tế từ nhóm chuyên gia và giảng viên dạy lập trình về tính hữu dụng, khả năng giải thích và đạo đức AI.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs self-start md:self-center"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Xuất kết quả khảo sát (CSV)</span>
        </button>
      </div>

      {/* Aggregate Score Cards: Rạch ròi giữa Thực tế và Tham khảo Mẫu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Thẻ 1: Khảo sát thực tế từ Giáo viên (Chính thức) */}
        <div className="lg:col-span-2 bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Điểm Khảo sát Thực tế (Chính thức từ Giảng viên)</span>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                {realCount} phiếu thực tế
              </span>
            </div>

            {realMetrics ? (
              <div className="mt-2">
                <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                  {realMetrics.overall} / 5.00
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Điểm trung bình tính toán độc lập từ các phiếu đánh giá thực tế (hoàn toàn loại trừ các phiếu mẫu).
                </p>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Chưa có phiếu khảo sát thực tế (N/A)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Hiện chưa có phản hồi nào được gửi từ biểu mẫu bên dưới. Thầy/Cô hãy điền biểu mẫu đánh giá để ghi nhận điểm số thực tế đầu tiên.
                </p>
              </div>
            )}
          </div>

          {realMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-2 border-t border-slate-800">
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Dễ sử dụng</span>
                <span className="font-mono font-bold text-sky-300">{realMetrics.avgQ1}/5</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Giải thích rõ</span>
                <span className="font-mono font-bold text-emerald-300">{realMetrics.avgQ3}/5</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Không kỳ thị</span>
                <span className="font-mono font-bold text-purple-300">{realMetrics.avgQ6}/5</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Sẵn sàng dùng</span>
                <span className="font-mono font-bold text-amber-300">{realMetrics.avgQ7}/5</span>
              </div>
            </div>
          )}
        </div>

        {/* Thẻ 2: Khảo sát mẫu (Chỉ mang tính chất tham khảo minh họa) */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>Phiếu mẫu minh họa</span>
              </span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded">
                Tham khảo
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
              {sampleMetrics ? `${sampleMetrics.overall} / 5.00` : 'N/A'}
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Bao gồm <strong>{sampleCount}</strong> phiếu mẫu kịch bản thử nghiệm ban đầu. Nhóm này được cách ly riêng và <strong>không tính gộp</strong> vào điểm trung bình thực tế.
            </p>
          </div>
          <div className="text-[11px] text-amber-900/80 border-t border-amber-200 pt-2.5 mt-3 font-medium">
            Đã gắn nhãn cố định <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">is_sample: true</code>
          </div>
        </div>
      </div>

      {submittedSuccess && (
        <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Cảm ơn Thầy/Cô! Phản hồi đánh giá đã được lưu vào hệ thống và gắn nhãn "Phản hồi thực tế".</span>
        </div>
      )}

      {/* Main Grid: Form and Survey Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Đánh giá mới */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              Biểu mẫu Đánh giá Dành cho Giảng viên
            </h2>
            <p className="text-xs text-slate-500">
              Thầy/Cô vui lòng nhập thông tin thực tế và chọn mức độ đồng ý từ 1 (Rất không đồng ý) đến 5 (Rất đồng ý).
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Họ tên / Chức danh GV <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: TS. Nguyễn Văn A"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-700 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Môn học phụ trách <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lập trình C/C++, Cấu trúc dữ liệu..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-700 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* 7 Likert Questions */}
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                Đánh giá theo Thang đo Likert 5 mức <span className="text-rose-500">*</span>
              </div>
              {likertQuestions.map((q) => (
                <div key={q.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
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
                          <span
                            className={`font-mono font-semibold ${
                              q.val === val ? 'text-sky-900 font-bold' : 'text-slate-600'
                            }`}
                          >
                            {val}
                          </span>
                        </label>
                      ))}
                    </div>
                    <span className="text-[10px]">5 - Rất đồng ý</span>
                  </div>
                  {q.val === 0 && (
                    <span className="text-[10px] text-amber-600 block italic">
                      (Chưa chọn mức điểm)
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Open-ended Questions (Không bắt buộc và KHÔNG tự điền câu khen mặc định) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                Ý kiến Đóng góp Mở (Tùy chọn)
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                  Chỉ báo nào hữu ích nhất đối với Thầy/Cô?
                </label>
                <input
                  type="text"
                  value={mostUseful}
                  onChange={(e) => setMostUseful(e.target.value)}
                  placeholder="Nhập nhận xét của Thầy/Cô (để trống nếu không có)..."
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
                  placeholder="Nhập trường hợp cảnh báo chưa chuẩn xác (nếu có)..."
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
                  placeholder="Ý kiến góp ý phát triển thêm cho CodeCare..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi Đánh giá Chuyên môn</span>
            </button>
          </form>
        </div>

        {/* Danh sách các đánh giá đã ghi nhận - Hiển thị 2 nhóm riêng biệt */}
        <div className="space-y-5">
          {/* Nhóm 1: Khảo sát thực tế */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>1. Phản hồi Khảo sát Thực tế ({realCount} phiếu)</span>
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                Dữ liệu chính thức
              </span>
            </div>

            {realCount === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                Chưa có phiếu khảo sát thực tế nào được gửi. Các phiếu gửi từ biểu mẫu bên trái sẽ xuất hiện tại đây.
              </div>
            ) : (
              <div className="space-y-3">
                {realSurveys.map((sv) => (
                  <div
                    key={sv.id}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{sv.teacher_name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                            Phản hồi thực tế
                          </span>
                        </div>
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
                      {sv.most_useful_indicator && (
                        <div>
                          <span className="font-semibold text-slate-800">Chỉ báo hữu ích: </span>
                          {sv.most_useful_indicator}
                        </div>
                      )}
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
            )}
          </div>

          {/* Nhóm 2: Khảo sát mẫu tham khảo */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>2. Phiếu Khảo sát Mẫu Tham khảo ({sampleCount} phiếu)</span>
              </h2>
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                Dữ liệu mẫu demo
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Các phản hồi kịch bản mẫu phục vụ đánh giá giao diện ban đầu; đã được tách riêng để không làm ảnh hưởng đến dữ liệu khảo sát thực tế.
            </p>

            <div className="space-y-3">
              {sampleSurveys.map((sv) => (
                <div
                  key={sv.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2 opacity-90"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{sv.teacher_name}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200 font-semibold">
                          Khảo sát mẫu
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">{sv.subject}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
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
                    {sv.most_useful_indicator && (
                      <div>
                        <span className="font-semibold text-slate-800">Chỉ báo hữu ích: </span>
                        {sv.most_useful_indicator}
                      </div>
                    )}
                    {sv.unreasonable_alert && (
                      <div>
                        <span className="font-semibold text-slate-800">Cảnh báo chưa chuẩn: </span>
                        {sv.unreasonable_alert}
                      </div>
                    )}
                    {sv.suggestions && (
                      <div className="italic text-slate-700 bg-slate-100 p-2 rounded border border-slate-200">
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
