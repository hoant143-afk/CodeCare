import React from 'react';
import {
  BookMarked,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Lock,
  FileText,
  AlertOctagon,
  Award,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const ResponsibleAIView: React.FC = () => {
  const principles = [
    {
      num: '01',
      title: 'Tối thiểu hóa dữ liệu (Data Minimization)',
      desc: 'Chỉ thu thập và phân tích các dữ liệu kỹ thuật cần thiết phục vụ học tập lập trình (lượt chạy mã, test pass, lỗi cú pháp, nộp bài). Không lưu họ tên thật, email, số điện thoại, địa chỉ hay bất kỳ thuộc tính nhạy cảm nào.',
      icon: Lock,
      tag: 'Bảo vệ quyền riêng tư',
    },
    {
      num: '02',
      title: 'Không xếp hạng gây kỳ thị (Anti-Stigmatization)',
      desc: 'Tuyệt đối không xếp hạng người học từ "kém" đến "giỏi", không hiển thị bảng xếp thứ tự rủi ro, và không dùng các từ ngữ tiêu cực (học sinh yếu, kém, nguy hiểm, thất bại). Chỉ sử dụng thuật ngữ sư phạm: "Có dấu hiệu cần hỗ trợ", "Theo dõi thêm", "Bình thường".',
      icon: AlertOctagon,
      tag: 'Nguyên tắc nhân văn',
    },
    {
      num: '03',
      title: 'Có thể giải thích minh bạch (Explainable AI)',
      desc: 'Không bao giờ chỉ đưa ra một con số Risk Score khô khan mà không có căn cứ. Mọi gợi ý đều đi kèm danh sách bằng chứng cụ thể và có thể kiểm chứng (ví dụ: test pass 29%, 2 bài nộp trễ, 24 lần chạy lỗi lặp).',
      icon: Sparkles,
      tag: 'Minh bạch thuật toán',
    },
    {
      num: '04',
      title: 'Con người kiểm soát tối cao (Human-in-the-Loop)',
      desc: 'AI chỉ đóng vai trò trợ lý hỗ trợ quan sát. Mọi cảnh báo phải qua bước phê duyệt chủ động của giảng viên. Hệ thống không tự động kích hoạt can thiệp hay gửi tin nhắn kỷ luật học sinh mà không có sự đồng ý của thầy cô.',
      icon: UserCheck,
      tag: 'Quyền tự quyết sư phạm',
    },
    {
      num: '05',
      title: 'Quyền ghi đè của giáo viên (Teacher Override)',
      desc: 'Giáo viên luôn có quyền cao nhất để bác bỏ cảnh báo (Dismiss) khi nhận thấy người học đang thử nghiệm dự án nâng cao hoặc bối cảnh ngoài LMS không phản ánh nguy cơ thực tế.',
      icon: ShieldCheck,
      tag: 'Tôn trọng chuyên môn',
    },
    {
      num: '06',
      title: 'Có nhật ký giải trình đầy đủ (Auditability & Logging)',
      desc: 'Mọi sự kiện sinh cảnh báo, phê duyệt, bác bỏ và kế hoạch can thiệp đều được ghi chép có dấu thời gian trong Nhật ký Audit Log, phục vụ việc đối soát và nghiên cứu cải tiến.',
      icon: FileText,
      tag: 'Trách nhiệm giải trình',
    },
    {
      num: '07',
      title: 'Không tự động chốt điểm số hay kỷ luật',
      desc: 'Hệ thống tuyệt đối không dùng điểm Evidence Score để tính điểm thi đua, không tự chốt điểm học phần và không tạo chế tài xử phạt người học dưới bất kỳ hình thức nào.',
      icon: Award,
      tag: 'Công bằng đánh giá',
    },
    {
      num: '08',
      title: 'Cam kết Dữ liệu Giả lập (Synthetic Demo Environment)',
      desc: 'Toàn bộ dữ liệu trong nguyên mẫu này là dữ liệu giả lập (synthetic data) được sinh ra nhằm mục đích nghiên cứu học thuật của đề tài môn học Trí tuệ Nhân tạo trong Giáo dục. Không có dữ liệu của bất kỳ sinh viên thật nào.',
      icon: CheckCircle2,
      tag: 'Chuẩn mực đạo đức',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-sky-800" />
            <span>Khung Nguyên tắc AI có Trách nhiệm trong Giáo dục (Responsible AI)</span>
          </h1>
          <span className="text-xs bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded">
            CS-AI-Edu Capstone
          </span>
        </div>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          CodeCare được xây dựng tuân thủ nghiêm ngặt Hướng dẫn Đạo đức AI trong Giáo dục của UNESCO và Khung Đạo đức Học máy. AI đóng vai trò như chiếc kính lúp sư phạm, người cầm lái luôn là Thầy Cô giáo.
        </p>
      </div>

      {/* Grid of 8 Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {principles.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.num}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Nguyên tắc {item.num}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.tag}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-sky-800" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-sm leading-snug">
                    {item.title}
                  </h2>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-10.5">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Institutional Ethics Statement */}
      <div className="bg-sky-50/70 rounded-xl border border-sky-200 p-5 text-sky-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Info className="w-4 h-4 text-sky-800" />
          <span>Tuyên bố Đạo đức Nghiên cứu Học thuật</span>
        </div>
        <p className="text-xs leading-relaxed text-sky-900">
          "CodeCare là nguyên mẫu dashboard hỗ trợ giáo viên phát hiện sớm các dấu hiệu người học gặp khó khăn trong quá trình học lập trình dựa trên dữ liệu học tập. Hệ thống không thay thế quyết định chuyên môn của giáo viên. Mọi giải pháp công nghệ đều hướng tới mục tiêu tối thượng: nâng đỡ và đồng hành cùng người học vượt qua rào cản tư duy thuật toán."
        </p>
      </div>
    </div>
  );
};
