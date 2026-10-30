import React, { useState } from 'react';
import {
  Database,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Shield,
  FileSpreadsheet,
  Check,
  Sparkles,
} from 'lucide-react';

interface DataManagementViewProps {
  onResetDemo: () => void;
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  onResetDemo,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleReset = () => {
    onResetDemo();
    setShowConfirmModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Data dictionary dictionary items
  const dataDictionary = [
    {
      name: 'learner_id',
      type: 'String (STU001 - STU080)',
      meaning: 'Mã định danh người học đã được ẩn danh hóa',
      range: 'STU001 .. STU080',
      missing: 'Bắt buộc, không được phép rỗng',
      usedInAlert: 'Không (chỉ định danh)',
    },
    {
      name: 'class_name',
      type: 'Enum (LOP_A, LOP_B, LOP_C)',
      meaning: 'Lớp sinh hoạt chuyên môn',
      range: 'LOP_A, LOP_B, LOP_C',
      missing: 'Mặc định gán LOP_A',
      usedInAlert: 'Không (chỉ dùng phân nhóm công bằng)',
    },
    {
      name: 'week',
      type: 'Integer (1..8)',
      meaning: 'Tuần học hiện tại trong học kỳ',
      range: '1 .. 8',
      missing: 'Mặc định tuần 6',
      usedInAlert: 'Không (chỉ xác định mốc thời gian)',
    },
    {
      name: 'login_count_7d',
      type: 'Integer',
      meaning: 'Số lần đăng nhập hệ thống LMS trong 7 ngày gần nhất',
      range: '0 .. 50',
      missing: 'Gán giá trị 0',
      usedInAlert: 'Có (xác định mức hoạt động)',
    },
    {
      name: 'active_days_7d',
      type: 'Integer',
      meaning: 'Số ngày có thao tác học tập/viết code trong tuần',
      range: '0 .. 7 ngày',
      missing: 'Gán giá trị 0',
      usedInAlert: 'Có (+1đ nếu <= 2 ngày)',
    },
    {
      name: 'assignments_due',
      type: 'Integer',
      meaning: 'Số nhiệm vụ/bài tập được giao đến tuần hiện tại',
      range: '1 .. 10',
      missing: 'Không được phép = 0',
      usedInAlert: 'Có (mẫu số tính submission_rate)',
    },
    {
      name: 'assignments_submitted',
      type: 'Integer',
      meaning: 'Số bài tập người học đã hoàn thành nộp',
      range: '0 .. assignments_due',
      missing: 'Gán 0',
      usedInAlert: 'Có (+2đ nếu submission_rate < 70%)',
    },
    {
      name: 'late_submissions',
      type: 'Integer',
      meaning: 'Số bài nộp sau hạn chót (deadline)',
      range: '0 .. assignments_due',
      missing: 'Gán 0',
      usedInAlert: 'Có (+1đ nếu >= 2 bài trễ)',
    },
    {
      name: 'code_runs',
      type: 'Integer',
      meaning: 'Số lần thực thi biên dịch/chạy mã nguồn trên hệ thống',
      range: '0 .. 200',
      missing: 'Gán 0',
      usedInAlert: 'Có (+1đ nếu >= 15 lần & pass < 40%)',
    },
    {
      name: 'syntax_errors',
      type: 'Integer',
      meaning: 'Số lỗi cú pháp (compile/syntax error)',
      range: '>= 0',
      missing: 'Gán 0',
      usedInAlert: 'Có (thành phần tính error_rate)',
    },
    {
      name: 'runtime_errors',
      type: 'Integer',
      meaning: 'Số lỗi runtime (segmentation fault, null pointer...)',
      range: '>= 0',
      missing: 'Gán 0',
      usedInAlert: 'Có (thành phần tính error_rate)',
    },
    {
      name: 'logic_errors',
      type: 'Integer',
      meaning: 'Số lỗi sai logic (chạy được nhưng output sai test case)',
      range: '>= 0',
      missing: 'Gán 0',
      usedInAlert: 'Có (thành phần tính error_rate)',
    },
    {
      name: 'tests_passed',
      type: 'Integer',
      meaning: 'Số lượng test case tự động đã vượt qua',
      range: '0 .. total_tests',
      missing: 'Gán 0',
      usedInAlert: 'Có (tính test_pass_rate)',
    },
    {
      name: 'total_tests',
      type: 'Integer',
      meaning: 'Tổng số test case trong bộ kiểm thử của bài tập',
      range: '>= 1',
      missing: 'Gán 1',
      usedInAlert: 'Có (+2đ nếu test_pass_rate < 50%)',
    },
    {
      name: 'average_score',
      type: 'Float (0.0 .. 10.0)',
      meaning: 'Điểm trung bình các bài thực hành đã chấm',
      range: '0.0 .. 10.0',
      missing: 'Gán điểm trung vị lớp',
      usedInAlert: 'Không (chỉ hiển thị tham khảo)',
    },
    {
      name: 'previous_test_pass_rate',
      type: 'Float (0.0 .. 1.0)',
      meaning: 'Tỷ lệ test pass trung bình ở các tuần trước',
      range: '0.0 .. 1.0',
      missing: 'Gán bằng current_test_pass_rate',
      usedInAlert: 'Có (tính xu hướng tiến độ trend)',
    },
    {
      name: 'current_test_pass_rate',
      type: 'Float (0.0 .. 1.0)',
      meaning: 'Tỷ lệ test pass ở tuần hiện tại',
      range: '0.0 .. 1.0',
      missing: 'Gán 0.0',
      usedInAlert: 'Có (+1đ nếu xu hướng DECLINING)',
    },
    {
      name: 'teacher_label',
      type: 'Enum (NEED_SUPPORT, NORMAL)',
      meaning: 'Nhãn đánh giá chuyên môn của giảng viên (Ground truth)',
      range: 'NEED_SUPPORT, NORMAL',
      missing: 'Bắt buộc trong tập đánh giá',
      usedInAlert: 'Không (chỉ dùng trong Audit mô hình)',
    },
  ];

  const cleaningFlow = [
    {
      step: 'Bước 1',
      title: 'Dữ liệu thô',
      desc: 'Trích xuất logs từ LMS Moodle & Web Compiler thực hành',
    },
    {
      step: 'Bước 2',
      title: 'Kiểm tra trùng lặp',
      desc: 'Loại bỏ các log sự kiện chạy mã bị gửi đúp do bấm nhiều lần',
    },
    {
      step: 'Bước 3',
      title: 'Kiểm tra giá trị thiếu',
      desc: 'Xử lý các giá trị null bằng giá trị 0 hoặc trung vị kỹ thuật',
    },
    {
      step: 'Bước 4',
      title: 'Kiểm tra bất hợp lý',
      desc: 'Rà soát test_passed > total_tests hoặc nộp bài > bài được giao',
    },
    {
      step: 'Bước 5',
      title: 'Chuẩn hóa số liệu',
      desc: 'Chuẩn hóa tỷ lệ về khoảng [0.0, 1.0] và điểm về thang 10',
    },
    {
      step: 'Bước 6',
      title: 'Tạo biến dẫn xuất',
      desc: 'Tính submission_rate, error_rate, test_pass_rate, progress_trend',
    },
    {
      step: 'Bước 7',
      title: 'Ẩn danh hóa (De-ID)',
      desc: 'Thay thế họ tên, email, MSV bằng STU001..STU080; loại bỏ PII',
    },
    {
      step: 'Bước 8',
      title: 'Bộ dữ liệu sạch',
      desc: 'Bộ dữ liệu chuẩn sẵn sàng cho công cụ suy luận cảnh báo',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-800" />
            <span>Quản trị Dữ liệu & Quy trình Làm sạch</span>
          </h1>
          <p className="text-xs text-slate-500">
            Từ điển biến số học tập, chu trình làm sạch và kiểm soát chất lượng dữ liệu Learning Analytics
          </p>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="px-3.5 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Tạo lại dữ liệu demo (Reset)</span>
        </button>
      </div>

      {showSuccessToast && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Đã thiết lập lại dữ liệu demo và các quyết định giáo viên về trạng thái ban đầu thành công!</span>
        </div>
      )}

      {/* C. Thống kê chất lượng dữ liệu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-medium">Tổng số bản ghi</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">80</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Hồ sơ người học hoàn chỉnh</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-medium">Bản ghi thiếu (Missing)</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">0</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">100% trường dữ liệu đầy đủ</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-medium">Bản ghi bất thường đã xử lý</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">0</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Đã hiệu chỉnh qua bước 4</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block font-medium">Bảo vệ quyền riêng tư</span>
          <span className="text-2xl font-bold text-sky-800 font-mono tabular-nums">100%</span>
          <span className="text-[11px] text-sky-700 block mt-0.5">Không lưu PII, ẩn danh STUxxx</span>
        </div>
      </div>

      {/* B. Quy trình làm sạch dữ liệu (Flowchart) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            B. Chu trình Tiền xử lý & Làm sạch Dữ liệu (Pipeline 8 bước)
          </h2>
          <p className="text-xs text-slate-500">
            Dữ liệu từ máy chủ thu thập sự kiện được lọc sạch trước khi đưa vào mô hình tính Evidence Score
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {cleaningFlow.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 relative"
            >
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
                <span>{item.step}</span>
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
              </div>
              <div className="font-bold text-slate-800 text-xs">{item.title}</div>
              <div className="text-[11px] text-slate-600 leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* A. Từ điển dữ liệu (Data Dictionary Table) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-3 p-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-800" />
            <span>A. Từ điển Dữ liệu Chi tiết (Data Dictionary)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Mô tả cấu trúc dữ liệu, kiểu giá trị, phạm vi hợp lệ và mục đích sử dụng của từng thuộc tính
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
              <tr>
                <th className="py-2.5 px-3">Tên biến số</th>
                <th className="py-2.5 px-3">Kiểu dữ liệu</th>
                <th className="py-2.5 px-3">Ý nghĩa học thuật</th>
                <th className="py-2.5 px-3">Phạm vi hợp lệ</th>
                <th className="py-2.5 px-3">Xử lý dữ liệu thiếu</th>
                <th className="py-2.5 px-3">Dùng cảnh báo?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dataDictionary.map((item) => (
                <tr key={item.name} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-sky-950">
                    {item.name}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                    {item.type}
                  </td>
                  <td className="py-2 px-3">
                    {item.meaning}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                    {item.range}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-500">
                    {item.missing}
                  </td>
                  <td className="py-2 px-3">
                    {item.usedInAlert.startsWith('Có') ? (
                      <span className="font-semibold text-rose-700 text-[11px]">
                        {item.usedInAlert}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">
                        {item.usedInAlert}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Xác nhận Khôi phục Dữ liệu Demo?
                </h3>
                <span className="text-xs text-slate-500">Hành động này không thể hoàn tác</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Toàn bộ các quyết định xác nhận của giáo viên, ghi chú can thiệp và ngưỡng cài đặt sẽ được đưa về dữ liệu mẫu ban đầu (80 học sinh, các kịch bản mẫu).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                Đồng ý Tạo lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
