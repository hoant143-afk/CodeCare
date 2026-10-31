import React, { useState, useMemo, useRef } from 'react';
import {
  Database,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Shield,
  FileSpreadsheet,
  Check,
  Download,
  Upload,
  Undo2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { validateLearnerDataset } from '../../services/dataValidator';
import { exportLearnersToCSV, downloadFile } from '../../services/exportService';
import { calculateDerivedLearner } from '../../services/analytics';
import { LearnerDerived } from '../../types';

interface DataManagementViewProps {
  onResetDemo: () => void;
  onDataReload?: () => void;
  learners?: LearnerDerived[];
}

export const DataManagementView: React.FC<DataManagementViewProps> = ({
  onResetDemo,
  onDataReload,
  learners,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Backup & Restore states
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [pendingBackupData, setPendingBackupData] = useState<string>('');
  const [backupPreview, setBackupPreview] = useState<{ valid: boolean; error?: string; summary?: any } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate raw data directly from storage
  const rawLearners = StorageService.getLearnersRaw();
  const validationReport = useMemo(() => validateLearnerDataset(rawLearners), [rawLearners]);

  // Derived learners for CSV export if not passed
  const activeThresholds = StorageService.getThresholds();
  const activeReviews = StorageService.getTeacherReviews();
  const currentDerivedLearners = useMemo(() => {
    if (learners && learners.length > 0) return learners;
    return rawLearners.map((r) => calculateDerivedLearner(r, activeThresholds, activeReviews[r.learner_id]));
  }, [learners, rawLearners, activeThresholds, activeReviews]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReset = () => {
    onResetDemo();
    setShowConfirmModal(false);
    showToast('Đã thiết lập lại dữ liệu demo và các quyết định giáo viên về trạng thái ban đầu thành công!');
  };

  const handleExportBackupJSON = () => {
    const backupJson = StorageService.createBackup();
    downloadFile(
      backupJson,
      `CodeCare_Backup_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8;'
    );
    showToast('Đã tải xuống bản sao lưu toàn bộ hệ thống (JSON).');
  };

  const handleExportLearnersCSV = () => {
    exportLearnersToCSV(currentDerivedLearners);
    showToast('Đã xuất danh sách người học dạng CSV thành công.');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPendingBackupData(content);
      const preview = StorageService.previewBackup(content);
      setBackupPreview(preview);
      setRestoreModalOpen(true);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!pendingBackupData) return;
    const result = StorageService.restoreBackup(pendingBackupData);
    if (result.success) {
      setRestoreModalOpen(false);
      setPendingBackupData('');
      setBackupPreview(null);
      if (onDataReload) onDataReload();
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleRollback = () => {
    const result = StorageService.rollback();
    if (result.success) {
      if (onDataReload) onDataReload();
      showToast('Đã hoàn tác và phục hồi phiên dữ liệu trước đó thành công!', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  // Data dictionary items
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
      {/* Hidden file input for restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-800" />
            <span>Quản trị Dữ liệu & Quy trình Làm sạch</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Từ điển biến số học tập, kiểm định chất lượng thực tế, chu trình làm sạch và an toàn sao lưu dữ liệu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Nạp bản sao lưu JSON an toàn kèm xem trước"
          >
            <Upload className="w-3.5 h-3.5 text-sky-700" />
            <span>Khôi phục (Restore JSON)</span>
          </button>

          <button
            onClick={handleExportBackupJSON}
            className="px-3 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Tải toàn bộ cấu hình, hồ sơ và nhật ký"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sao lưu (Backup JSON)</span>
          </button>

          <button
            onClick={handleExportLearnersCSV}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Xuất bảng dữ liệu người học dạng CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Đưa toàn bộ về dữ liệu mẫu ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tạo lại demo (Reset)</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={handleRollback}
            className="px-2 py-0.5 rounded bg-white/80 hover:bg-white text-slate-800 border border-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Undo2 className="w-3 h-3 text-slate-600" />
            <span>Hoàn tác (Rollback)</span>
          </button>
        </div>
      )}

      {/* C. Thống kê kiểm định chất lượng dữ liệu THỰC TẾ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-800" />
              <span>Kiểm định Chất lượng Dữ liệu Thực tế (Data Quality Audit)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Kiểm tra tính nhất quán logic, quan hệ ràng buộc (submitted ≤ due, passed ≤ total) và tính toàn vẹn
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold border flex items-center gap-1.5 ${
              validationReport.invalidRecords === 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {validationReport.invalidRecords === 0 ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />}
            {validationReport.invalidRecords === 0 ? 'Dữ liệu Hợp lệ (100% Valid)' : 'Phát hiện Bất thường'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 block font-medium">Tổng số bản ghi</span>
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {validationReport.totalRecords}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Hồ sơ người học giả lập</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 block font-medium">Bản ghi hợp lệ</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {validationReport.validRecords}
            </span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">
              Đạt toàn bộ ràng buộc kỹ thuật
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 block font-medium">Lỗi logic / Bất thường</span>
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                validationReport.issues.length === 0 ? 'text-slate-900' : 'text-rose-700'
              }`}
            >
              {validationReport.issues.length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {validationReport.issues.length === 0 ? 'Không phát hiện lỗi quan hệ' : 'Cần hiệu chỉnh dữ liệu'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 block font-medium">Bảo vệ quyền riêng tư</span>
            <span className="text-2xl font-bold text-sky-800 font-mono tabular-nums">100%</span>
            <span className="text-[11px] text-sky-700 block mt-0.5">Ẩn danh STU001..STU080, không PII</span>
          </div>
        </div>

        {/* Display issues if any */}
        {validationReport.issues.length > 0 && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-rose-800 block">Danh sách cảnh báo chất lượng:</span>
            {validationReport.issues.map((iss, i) => (
              <div key={i} className="text-rose-700">
                • [{iss.learner_id}] Trường <span className="font-mono font-bold">{iss.field}</span> ({iss.issueType}): {iss.description}
              </div>
            ))}
          </div>
        )}
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

      {/* Restore Preview Modal */}
      {restoreModalOpen && backupPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-sky-800">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5 text-sky-800" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Xem trước Tệp Sao lưu & Xác nhận Khôi phục
                </h3>
                <span className="text-xs text-slate-500">
                  Hệ thống tự động lưu bản snapshot trước khi ghi đè để bảo đảm an toàn
                </span>
              </div>
            </div>

            {backupPreview.valid ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Thời gian xuất:</span>
                    <span className="font-semibold">{backupPreview.summary.exported_at}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Số hồ sơ người học:</span>
                    <span className="font-semibold text-sky-900 font-mono">{backupPreview.summary.learners_count} học viên</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Quyết định giáo viên:</span>
                    <span className="font-semibold text-emerald-800 font-mono">{backupPreview.summary.reviews_count} bản ghi</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nhật ký Audit Log:</span>
                    <span className="font-semibold text-slate-800 font-mono">{backupPreview.summary.logs_count} logs</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Cấu trúc dữ liệu hợp lệ và sẵn sàng nạp vào hệ thống.</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <span className="font-semibold">Tệp không hợp lệ: </span>
                  <span>{backupPreview.error}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setRestoreModalOpen(false);
                  setPendingBackupData('');
                  setBackupPreview(null);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              {backupPreview.valid && (
                <button
                  onClick={handleConfirmRestore}
                  className="px-4 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Xác nhận Khôi phục
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Demo Reset */}
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
                <span className="text-xs text-slate-500">Hành động này sẽ đưa về dữ liệu chuẩn ban đầu</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Toàn bộ các quyết định xác nhận của giáo viên, ghi chú can thiệp và ngưỡng cài đặt sẽ được đưa về dữ liệu mẫu ban đầu (80 học sinh, các kịch bản mẫu).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
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
