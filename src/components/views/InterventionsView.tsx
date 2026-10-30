import React, { useState } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Save,
  UserCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import {
  LearnerDerived,
  InterventionType,
  InterventionStatus,
} from '../../types';

interface InterventionsViewProps {
  learners: LearnerDerived[];
  onSelectLearner: (learnerId: string) => void;
  onUpdateIntervention: (
    learnerId: string,
    type: InterventionType,
    status: InterventionStatus,
    date: string,
    notes: string,
    outcome: string
  ) => void;
}

export const InterventionsView: React.FC<InterventionsViewProps> = ({
  learners,
  onSelectLearner,
  onUpdateIntervention,
}) => {
  // Only students with confirmed support or with active intervention
  const confirmedLearners = learners.filter(
    (l) => l.teacher_confirmation === 'CONFIRMED' || l.intervention_status !== 'NONE'
  );

  const [activeTab, setActiveTab] = useState<'tracker' | 'playbook'>('tracker');
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<LearnerDerived | null>(null);

  // Form states for modal/inline editing
  const [formType, setFormType] = useState<InterventionType>('Hỗ trợ trực tiếp');
  const [formStatus, setFormStatus] = useState<InterventionStatus>('IN_PROGRESS');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formOutcome, setFormOutcome] = useState<string>('');

  const openEdit = (l: LearnerDerived) => {
    setSelectedStudentForEdit(l);
    setFormType(l.intervention_type || 'Hỗ trợ trực tiếp');
    setFormStatus(l.intervention_status === 'NONE' ? 'PENDING' : l.intervention_status);
    setFormDate(l.intervention_date || new Date().toISOString().split('T')[0]);
    setFormNotes(l.teacher_notes || '');
    setFormOutcome(l.intervention_outcome || '');
  };

  const handleSave = () => {
    if (!selectedStudentForEdit) return;
    onUpdateIntervention(
      selectedStudentForEdit.learner_id,
      formType,
      formStatus,
      formDate,
      formNotes,
      formOutcome
    );
    setSelectedStudentForEdit(null);
  };

  const pendingCount = confirmedLearners.filter((l) => l.intervention_status === 'PENDING').length;
  const inProgressCount = confirmedLearners.filter((l) => l.intervention_status === 'IN_PROGRESS').length;
  const completedCount = confirmedLearners.filter((l) => l.intervention_status === 'COMPLETED').length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-sky-800" />
            <span>Kế hoạch & Quản lý Can thiệp Sư phạm</span>
          </h1>
          <p className="text-xs text-slate-500">
            Dành riêng cho những người học đã được giáo viên xác nhận cần hỗ trợ. Theo dõi tiến độ và hiệu quả can thiệp.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'tracker'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh sách can thiệp ({confirmedLearners.length})
          </button>
          <button
            onClick={() => setActiveTab('playbook')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'playbook'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sổ tay 5 Kịch bản Sư phạm
          </button>
        </div>
      </div>

      {activeTab === 'tracker' ? (
        <>
          {/* Status summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Chưa thực hiện</span>
                <span className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
                  {pendingCount}
                </span>
                <span className="text-[11px] text-slate-400 block">Đang lên lịch hỗ trợ</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Đang thực hiện</span>
                <span className="text-2xl font-bold text-sky-800 font-mono tabular-nums">
                  {inProgressCount}
                </span>
                <span className="text-[11px] text-slate-400 block">Đang hướng dẫn / giao bài</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Đã hoàn thành</span>
                <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                  {completedCount}
                </span>
                <span className="text-[11px] text-slate-400 block">Đã ghi nhận kết quả tiến bộ</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Interventions Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bảng theo dõi kế hoạch can thiệp ({confirmedLearners.length} hồ sơ đã duyệt)
              </h2>
              <span className="text-xs text-slate-500">
                Nhấn "Cập nhật" để ghi chú kết quả hoặc thay đổi trạng thái
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-3 px-3.5">Mã người học</th>
                    <th className="py-3 px-3">Lớp</th>
                    <th className="py-3 px-3">Loại can thiệp</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3">Ngày hẹn / thực hiện</th>
                    <th className="py-3 px-3">Ghi chú & Hướng tiếp cận</th>
                    <th className="py-3 px-3">Kết quả sau can thiệp</th>
                    <th className="py-3 px-3.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {confirmedLearners.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        Chưa có người học nào được giáo viên xác nhận can thiệp. Vui lòng xem danh sách cảnh báo.
                      </td>
                    </tr>
                  ) : (
                    confirmedLearners.map((l) => (
                      <tr key={l.learner_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-sky-900">
                          <button
                            onClick={() => onSelectLearner(l.learner_id)}
                            className="hover:underline"
                          >
                            {l.learner_id}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {l.class_name}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {l.intervention_type || 'Hỗ trợ trực tiếp'}
                        </td>
                        <td className="py-3 px-3">
                          {l.intervention_status === 'COMPLETED' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Hoàn thành
                            </span>
                          ) : l.intervention_status === 'IN_PROGRESS' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-300">
                              Đang thực hiện
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                              Chưa thực hiện
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {l.intervention_date || 'Chưa đặt'}
                        </td>
                        <td className="py-3 px-3 max-w-xs text-slate-600 truncate">
                          {l.teacher_notes || 'Chưa có ghi chú'}
                        </td>
                        <td className="py-3 px-3 max-w-xs text-slate-700 font-medium truncate">
                          {l.intervention_outcome ? (
                            <span className="text-emerald-700">{l.intervention_outcome}</span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa cập nhật</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => openEdit(l)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-colors"
                          >
                            Cập nhật
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Playbook view: 5 pedagogical scenarios */
        <div className="space-y-4">
          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 text-xs text-sky-950 space-y-1">
            <h2 className="font-bold text-sm text-sky-950 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-800" />
              <span>Sổ tay Khung Can thiệp Sư phạm trong Dạy học Lập trình</span>
            </h2>
            <p className="text-sky-900 leading-relaxed">
              Các kịch bản được thiết kế dựa trên lý thuyết Vùng phát triển gần nhất (Vygotsky's ZPD) và Kỹ thuật Giàn giáo sư phạm (Scaffolding), hướng tới việc hỗ trợ tư duy giải quyết vấn đề thay vì đưa ra lời giải trực tiếp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Kịch bản 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Chạy code nhiều nhưng test đạt thấp
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Dấu hiệu: Vòng lặp thử-sai mù quáng (trial-and-error), lúng túng trong gỡ lỗi.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="font-semibold text-slate-800">Gợi ý can thiệp:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Kiểm tra lỗi cú pháp và lỗi con trỏ cơ bản.</li>
                  <li>Yêu cầu học sinh giải thích thuật toán bằng lời hoặc mã giả từng bước.</li>
                  <li>Hỗ trợ bằng các câu hỏi gợi mở (Socratic questioning) thay vì đưa đáp án.</li>
                  <li>Hướng dẫn cách đọc thông báo lỗi từ compiler một cách bài bản.</li>
                </ul>
              </div>
            </div>

            {/* Kịch bản 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Ít hoạt động và nhiều bài nộp trễ
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Dấu hiệu: Nguy cơ tụt lại phía sau về tiến độ, có thể do rào cản ngoại cảnh.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="font-semibold text-slate-800">Gợi ý can thiệp:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Chủ động nhắn tin/gặp mặt hỏi nguyên nhân (thiết bị, sức khỏe, công việc).</li>
                  <li>Kiểm tra khả năng truy cập phòng thực hành hoặc tài nguyên mạng.</li>
                  <li>Chia nhỏ nhiệm vụ lớn thành 2-3 mẩu bài tập ngắn với deadline trung gian.</li>
                  <li>Theo dõi sát trong 7 ngày kế tiếp.</li>
                </ul>
              </div>
            </div>

            {/* Kịch bản 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Hoạt động nhiều nhưng kết quả không tăng
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Dấu hiệu: Học sinh rất nỗ lực nhưng vướng mắc về mô hình tâm lý (mental model).
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="font-semibold text-slate-800">Gợi ý can thiệp:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Xem lại lịch sử các test case không vượt qua để nhận diện điểm mù lý thuyết.</li>
                  <li>Tổ chức phiên hỗ trợ ngắn 5-10 phút tại bàn trong giờ lab.</li>
                  <li>Giao bài tập bổ trợ có cấu trúc tương tự nhưng mức độ đơn giản hơn.</li>
                  <li>Khích lệ nỗ lực để tránh kiệt sức học tập (academic burnout).</li>
                </ul>
              </div>
            </div>

            {/* Kịch bản 4 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Điểm số và tỷ lệ test giảm liên tiếp
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Dấu hiệu: Hổng kiến thức nền tảng ở chủ đề chuyển tiếp (như từ vòng lặp sang mảng/hàm).
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="font-semibold text-slate-800">Gợi ý can thiệp:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Rà soát lại kết quả các tuần học trước để tìm mắt xích kiến thức bị đứt.</li>
                  <li>Cung cấp tài liệu tóm tắt công thức (cheat sheet) và sơ đồ tư duy.</li>
                  <li>Ghép đôi học tập cùng tiến với bạn trong nhóm thực hành.</li>
                </ul>
              </div>
            </div>

            {/* Kịch bản 5 */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center">
                  5
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Không đăng nhập nhiều ngày liên tiếp
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Dấu hiệu: Nguy cơ bỏ cuộc hoặc sự cố cá nhân đột xuất.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="font-semibold text-slate-800">Gợi ý can thiệp:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Liên hệ trực tiếp sớm nhất có thể để xác minh tình trạng.</li>
                  <li>Kiểm tra lỗi tài khoản LMS, hỗ trợ cấp lại quyền truy cập nếu gặp sự cố kỹ thuật.</li>
                  <li>Gia hạn nộp bài có điều kiện để học sinh không bị áp lực điểm số dồn dập.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Intervention Modal */}
      {selectedStudentForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-mono">
                  Cập nhật can thiệp: {selectedStudentForEdit.learner_id}
                </h3>
                <span className="text-xs text-slate-500">
                  Lớp: {selectedStudentForEdit.class_name}
                </span>
              </div>
              <button
                onClick={() => setSelectedStudentForEdit(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Hình thức can thiệp:
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Hỗ trợ trực tiếp">Hỗ trợ trực tiếp (1-on-1)</option>
                  <option value="Gợi ý từng bước">Gợi ý từng bước (Scaffolding)</option>
                  <option value="Giao bài bổ trợ">Giao bài bổ trợ nhẹ</option>
                  <option value="Nhắc tiến độ">Nhắc tiến độ & lịch nộp</option>
                  <option value="Theo dõi thêm">Theo dõi thêm phiên tới</option>
                  <option value="Trao đổi cá nhân">Trao đổi cá nhân</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Trạng thái can thiệp:
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="PENDING">Chưa thực hiện</option>
                  <option value="IN_PROGRESS">Đang thực hiện</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Ngày thực hiện / hẹn:
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Ghi chú hướng can thiệp:
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ghi chú hướng tiếp cận..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Kết quả sau can thiệp:
                </label>
                <textarea
                  rows={2}
                  value={formOutcome}
                  onChange={(e) => setFormOutcome(e.target.value)}
                  placeholder="Học sinh có hiểu bài hơn không? Có nộp lại bài lab thành công không?..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudentForEdit(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thông tin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
