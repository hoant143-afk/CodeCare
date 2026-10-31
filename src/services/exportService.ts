import {
  LearnerDerived,
  AuditMetric,
  ThresholdSimulationPoint,
  TeacherSurveyResponse,
  AuditLogItem,
  TestCaseItem,
} from '../types';

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportLearnersToCSV(learners: LearnerDerived[]) {
  const headers = [
    'Mã người học',
    'Lớp',
    'Mức hoạt động',
    'Tỷ lệ hoàn thành (%)',
    'Tỷ lệ test đạt (%)',
    'Số lần chạy code',
    'Tổng lỗi',
    'Tỷ lệ lỗi (%)',
    'Xu hướng tiến độ',
    'Evidence Score',
    'Trạng thái cảnh báo',
    'Xác nhận của GV',
    'Tình huống hỗ trợ',
    'Trạng thái can thiệp',
  ];

  const rows = learners.map((l) => [
    l.learner_id,
    l.class_name,
    l.activity_level,
    (l.submission_rate * 100).toFixed(1),
    (l.test_pass_rate * 100).toFixed(1),
    l.code_runs,
    l.total_errors,
    (l.error_rate * 100).toFixed(1),
    l.progress_trend,
    l.evidence_score,
    l.alert_status,
    l.teacher_confirmation,
    `"${l.intervention_situation || ''}"`,
    l.intervention_status,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  downloadFile(csvContent, `CodeCare_DanhSachNguoiHoc_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportAuditReportToJSON(
  metrics: AuditMetric,
  simulation: ThresholdSimulationPoint[],
  fairness: any
) {
  const data = {
    report_title: 'CodeCare - Báo cáo Audit Mô hình & Đánh giá Sư phạm',
    exported_at: new Date().toISOString(),
    evaluation_sample_size: 80,
    metrics: {
      true_positives: metrics.tp,
      false_positives: metrics.fp,
      true_negatives: metrics.tn,
      false_negatives: metrics.fn,
      accuracy: Number((metrics.accuracy * 100).toFixed(2)),
      precision: Number((metrics.precision * 100).toFixed(2)),
      recall: Number((metrics.recall * 100).toFixed(2)),
      f1_score: Number((metrics.f1 * 100).toFixed(2)),
      actionable_alert_rate: Number((metrics.actionableRate * 100).toFixed(2)),
    },
    threshold_tradeoff_simulation: simulation,
    fairness_subgroups: fairness,
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    `CodeCare_BaoCaoAudit_${new Date().toISOString().slice(0, 10)}.json`,
    'application/json;charset=utf-8;'
  );
}

export function exportInterventionsToCSV(learners: LearnerDerived[]) {
  const confirmed = learners.filter(
    (l) => l.teacher_confirmation === 'CONFIRMED' || (l.intervention_status && l.intervention_status !== 'NONE')
  );

  const headers = [
    'Mã người học',
    'Lớp',
    'Tình huống cần hỗ trợ',
    'Hình thức can thiệp',
    'Trạng thái',
    'Ngày thực hiện',
    'Ghi chú giáo viên',
    'Kết quả ghi nhận',
  ];

  const rows = confirmed.map((l) => [
    l.learner_id,
    l.class_name,
    `"${l.intervention_situation || ''}"`,
    `"${l.intervention_type || ''}"`,
    l.intervention_status,
    l.intervention_date || '',
    `"${(l.teacher_notes || '').replace(/"/g, '""')}"`,
    `"${(l.intervention_outcome || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  downloadFile(csvContent, `CodeCare_KeHoachCanThiep_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportSurveysToCSV(surveys: TeacherSurveyResponse[]) {
  const headers = [
    'Mã khảo sát',
    'Loại phản hồi',
    'Họ tên Giảng viên',
    'Môn học',
    'Thời gian',
    'Dễ sử dụng (1-5)',
    'Chỉ báo rõ ràng (1-5)',
    'Lý do minh bạch (1-5)',
    'Nhận biết kịp thời (1-5)',
    'Can thiệp thực tế (1-5)',
    'Không kỳ thị (1-5)',
    'Sẵn sàng dùng (1-5)',
    'Chỉ báo hữu ích nhất',
    'Cảnh báo chưa hợp lý',
    'Đề xuất cải tiến',
  ];

  const rows = surveys.map((s) => [
    s.id,
    s.is_sample ? 'Khảo sát mẫu' : 'Phản hồi thực tế',
    `"${s.teacher_name}"`,
    `"${s.subject}"`,
    s.created_at,
    s.q1_easy_to_use,
    s.q2_indicators_clear,
    s.q3_reasons_clear,
    s.q4_helps_identify,
    s.q5_realistic_interventions,
    s.q6_no_stigmatization,
    s.q7_would_use_in_practice,
    `"${(s.most_useful_indicator || '').replace(/"/g, '""')}"`,
    `"${(s.unreasonable_alert || '').replace(/"/g, '""')}"`,
    `"${(s.suggestions || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  downloadFile(csvContent, `CodeCare_KhaoSatGiangVien_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportTestReportToJSON(report: any) {
  downloadFile(
    JSON.stringify(report, null, 2),
    `CodeCare_BaoCaoKiemThu_${new Date().toISOString().slice(0, 10)}.json`,
    'application/json;charset=utf-8;'
  );
}

export function exportTestResultsToJSON(results: TestCaseItem[]) {
  exportTestReportToJSON(results);
}

export function exportAuditLogsToCSV(logs: AuditLogItem[]) {
  const headers = [
    'Mã Log',
    'Thời gian',
    'Đối tượng',
    'Sự kiện',
    'Lý do ghi nhận',
    'Kết quả hệ thống',
    'Quyết định GV',
    'Ghi chú',
  ];

  const rows = logs.map((l) => [
    l.id,
    l.timestamp,
    l.learner_id,
    `"${l.event_type}"`,
    `"${l.reasons.replace(/"/g, '""')}"`,
    `"${l.system_result.replace(/"/g, '""')}"`,
    `"${l.teacher_decision.replace(/"/g, '""')}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  downloadFile(csvContent, `CodeCare_NhatKyAuditLog_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}
