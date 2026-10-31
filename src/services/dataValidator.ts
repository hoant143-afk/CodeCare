import { LearnerRaw, DataQualityReport, DataQualityIssue } from '../types';

export interface DataCleaningLogItem {
  learner_id: string;
  field: string;
  original_value: any;
  cleaned_value: any;
  reason: string;
}

export interface CleanedDatasetResult {
  cleanedLearners: LearnerRaw[];
  changeLog: DataCleaningLogItem[];
  fixedIssuesCount: number;
}

export function validateLearnerDataset(learners: LearnerRaw[]): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  const seenIds = new Set<string>();
  const invalidRecordIndices = new Set<number>();

  const isBadNum = (v: any): boolean =>
    v === null || v === undefined || typeof v !== 'number' || Number.isNaN(v);

  const isBadInt = (v: any): boolean =>
    isBadNum(v) || !Number.isInteger(v);

  learners.forEach((l, index) => {
    let hasError = false;
    const recordLabel = l?.learner_id ? l.learner_id : `Bản ghi #${index + 1}`;

    // 0. Kiểm tra sự tồn tại của bản ghi
    if (!l || typeof l !== 'object') {
      issues.push({
        learner_id: `Bản ghi #${index + 1}`,
        field: 'record',
        issueType: 'MISSING_FIELD',
        description: 'Bản ghi không tồn tại hoặc không phải là object hợp lệ',
      });
      invalidRecordIndices.add(index);
      return;
    }

    // 1. Kiểm tra ID rỗng, sai kiểu dữ liệu hoặc trùng
    if (!l.learner_id || typeof l.learner_id !== 'string' || l.learner_id.trim() === '') {
      issues.push({
        learner_id: `Bản ghi #${index + 1}`,
        field: 'learner_id',
        issueType: 'MISSING_FIELD',
        description: 'Mã định danh người học bị trống, null/undefined hoặc không đúng kiểu string',
      });
      hasError = true;
    } else if (seenIds.has(l.learner_id)) {
      issues.push({
        learner_id: l.learner_id,
        field: 'learner_id',
        issueType: 'DUPLICATE_ID',
        description: `Mã người học ${l.learner_id} bị trùng lặp trong bộ dữ liệu`,
      });
      hasError = true;
    } else {
      seenIds.add(l.learner_id);
    }

    // 2. Kiểm tra lớp
    if (!l.class_name || !['LOP_A', 'LOP_B', 'LOP_C'].includes(l.class_name)) {
      issues.push({
        learner_id: recordLabel,
        field: 'class_name',
        issueType: 'OUT_OF_BOUNDS',
        description: `Lớp "${l.class_name}" không thuộc danh mục hợp lệ (LOP_A, LOP_B, LOP_C)`,
      });
      hasError = true;
    }

    // 3. Kiểm tra tuần hiện tại
    if (isBadInt(l.week) || l.week < 1 || l.week > 15) {
      issues.push({
        learner_id: recordLabel,
        field: 'week',
        issueType: 'OUT_OF_BOUNDS',
        description: `Tuần học (${l.week}) phải là số nguyên dương hợp lệ`,
      });
      hasError = true;
    }

    // 4. Kiểm tra số bài nộp và số bài được giao
    if (isBadInt(l.assignments_due) || l.assignments_due < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'assignments_due',
        issueType: 'OUT_OF_BOUNDS',
        description: `Số bài được giao (${l.assignments_due}) không phải số nguyên không âm hợp lệ`,
      });
      hasError = true;
    }
    if (isBadInt(l.assignments_submitted) || l.assignments_submitted < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'assignments_submitted',
        issueType: 'OUT_OF_BOUNDS',
        description: `Số bài đã nộp (${l.assignments_submitted}) không phải số nguyên không âm hợp lệ`,
      });
      hasError = true;
    }
    if (
      !isBadInt(l.assignments_submitted) &&
      !isBadInt(l.assignments_due) &&
      l.assignments_submitted > l.assignments_due
    ) {
      issues.push({
        learner_id: recordLabel,
        field: 'assignments_submitted',
        issueType: 'INVALID_RELATION',
        description: `Số bài đã nộp (${l.assignments_submitted}) lớn hơn tổng số bài được giao (${l.assignments_due})`,
      });
      hasError = true;
    }

    // Kiểm tra số bài nộp trễ và quan hệ với số bài đã nộp (STU007, STU034, STU060)
    if (isBadInt(l.late_submissions) || l.late_submissions < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'late_submissions',
        issueType: 'OUT_OF_BOUNDS',
        description: `Số bài nộp trễ (${l.late_submissions}) không phải số nguyên không âm`,
      });
      hasError = true;
    } else if (
      !isBadInt(l.assignments_submitted) &&
      l.late_submissions > l.assignments_submitted
    ) {
      issues.push({
        learner_id: recordLabel,
        field: 'late_submissions',
        issueType: 'INVALID_RELATION',
        description: `Số bài nộp trễ (${l.late_submissions}) vượt quá số bài đã nộp (${l.assignments_submitted})`,
      });
      hasError = true;
    }

    // 5. Kiểm tra test case
    if (isBadInt(l.total_tests) || l.total_tests < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'total_tests',
        issueType: 'OUT_OF_BOUNDS',
        description: `Tổng số test case (${l.total_tests}) không phải số nguyên không âm`,
      });
      hasError = true;
    }
    if (isBadInt(l.tests_passed) || l.tests_passed < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'tests_passed',
        issueType: 'OUT_OF_BOUNDS',
        description: `Số test case vượt qua (${l.tests_passed}) không phải số nguyên không âm`,
      });
      hasError = true;
    }
    if (
      !isBadInt(l.tests_passed) &&
      !isBadInt(l.total_tests) &&
      l.tests_passed > l.total_tests
    ) {
      issues.push({
        learner_id: recordLabel,
        field: 'tests_passed',
        issueType: 'INVALID_RELATION',
        description: `Số test vượt qua (${l.tests_passed}) lớn hơn tổng số test (${l.total_tests})`,
      });
      hasError = true;
    }

    // 6. Kiểm tra ngày hoạt động và số lần chạy mã
    if (isBadInt(l.active_days_7d) || l.active_days_7d < 0 || l.active_days_7d > 7) {
      issues.push({
        learner_id: recordLabel,
        field: 'active_days_7d',
        issueType: 'OUT_OF_BOUNDS',
        description: `Số ngày hoạt động (${l.active_days_7d}) phải là số nguyên trong khoảng 0 đến 7 ngày`,
      });
      hasError = true;
    }
    if (isBadInt(l.code_runs) || l.code_runs < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'code_runs',
        issueType: 'OUT_OF_BOUNDS',
        description: `Số lần chạy code (${l.code_runs}) không phải số nguyên không âm`,
      });
      hasError = true;
    }
    if (isBadInt(l.login_count_7d) || l.login_count_7d < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'login_count_7d',
        issueType: 'OUT_OF_BOUNDS',
        description: `Số lần đăng nhập (${l.login_count_7d}) không phải số nguyên không âm`,
      });
      hasError = true;
    }

    // 7. Kiểm tra lỗi biên dịch/runtime/logic
    if (isBadInt(l.syntax_errors) || l.syntax_errors < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'syntax_errors',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Số lỗi cú pháp không phải số nguyên không âm',
      });
      hasError = true;
    }
    if (isBadInt(l.runtime_errors) || l.runtime_errors < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'runtime_errors',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Số lỗi runtime không phải số nguyên không âm',
      });
      hasError = true;
    }
    if (isBadInt(l.logic_errors) || l.logic_errors < 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'logic_errors',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Số lỗi logic không phải số nguyên không âm',
      });
      hasError = true;
    }

    // 8. Kiểm tra tỷ lệ test pass trong khoảng [0, 1]
    if (isBadNum(l.previous_test_pass_rate) || l.previous_test_pass_rate < 0 || l.previous_test_pass_rate > 1) {
      issues.push({
        learner_id: recordLabel,
        field: 'previous_test_pass_rate',
        issueType: 'OUT_OF_BOUNDS',
        description: `Tỷ lệ test pass tuần trước (${l.previous_test_pass_rate}) nằm ngoài khoảng hợp lệ [0, 1]`,
      });
      hasError = true;
    }
    if (isBadNum(l.current_test_pass_rate) || l.current_test_pass_rate < 0 || l.current_test_pass_rate > 1) {
      issues.push({
        learner_id: recordLabel,
        field: 'current_test_pass_rate',
        issueType: 'OUT_OF_BOUNDS',
        description: `Tỷ lệ test pass hiện tại (${l.current_test_pass_rate}) nằm ngoài khoảng hợp lệ [0, 1]`,
      });
      hasError = true;
    }
    if (isBadNum(l.average_score) || l.average_score < 0 || l.average_score > 10) {
      issues.push({
        learner_id: recordLabel,
        field: 'average_score',
        issueType: 'OUT_OF_BOUNDS',
        description: `Điểm trung bình (${l.average_score}) nằm ngoài khoảng [0, 10]`,
      });
      hasError = true;
    }

    // 9. Kiểm tra dữ liệu lịch sử theo tuần và trùng tuần
    if (!Array.isArray(l.weekly_history) || l.weekly_history.length === 0) {
      issues.push({
        learner_id: recordLabel,
        field: 'weekly_history',
        issueType: 'MISSING_FIELD',
        description: 'Thiếu mảng dữ liệu lịch sử theo tuần hoặc mảng rỗng',
      });
      hasError = true;
    } else {
      const seenWeeks = new Set<number>();
      l.weekly_history.forEach((h, hIdx) => {
        if (!h || typeof h !== 'object') {
          issues.push({
            learner_id: recordLabel,
            field: `weekly_history[${hIdx}]`,
            issueType: 'MISSING_FIELD',
            description: `Dữ liệu lịch sử mục ${hIdx} không hợp lệ`,
          });
          hasError = true;
          return;
        }

        // Kiểm tra trùng tuần lịch sử
        if (isBadInt(h.week)) {
          issues.push({
            learner_id: recordLabel,
            field: `weekly_history[${hIdx}].week`,
            issueType: 'OUT_OF_BOUNDS',
            description: `Tuần lịch sử (${h.week}) không phải số nguyên hợp lệ`,
          });
          hasError = true;
        } else if (seenWeeks.has(h.week)) {
          issues.push({
            learner_id: recordLabel,
            field: `weekly_history[${hIdx}].week`,
            issueType: 'HISTORY_MISMATCH',
            description: `Tuần ${h.week} bị trùng lặp trong mảng lịch sử học tập`,
          });
          hasError = true;
        } else {
          seenWeeks.add(h.week);
        }

        if (
          isBadNum(h.test_pass_rate) ||
          h.test_pass_rate < 0 ||
          h.test_pass_rate > 1 ||
          isBadInt(h.code_runs) ||
          h.code_runs < 0 ||
          isBadInt(h.errors) ||
          h.errors < 0
        ) {
          issues.push({
            learner_id: recordLabel,
            field: `weekly_history[w=${h.week}]`,
            issueType: 'OUT_OF_BOUNDS',
            description: `Dữ liệu lịch sử tuần ${h.week} chứa giá trị NaN, âm hoặc ngoài khoảng [0, 1]`,
          });
          hasError = true;
        }
      });
    }

    if (hasError) {
      invalidRecordIndices.add(index);
    }
  });

  const totalRecords = learners.length;
  const invalidRecords = invalidRecordIndices.size;
  const validRecords = totalRecords - invalidRecords;

  return {
    totalRecords,
    validRecords,
    invalidRecords,
    issues,
    checkedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
  };
}

/**
 * Tạo bản dữ liệu làm sạch riêng kèm nhật ký thay đổi (Data Cleaning Log),
 * KHÔNG sửa âm thầm dữ liệu gốc.
 */
export function cleanLearnerDataset(learners: LearnerRaw[]): CleanedDatasetResult {
  const changeLog: DataCleaningLogItem[] = [];

  const cleanedLearners: LearnerRaw[] = learners.map((orig) => {
    // Deep clone record
    const copy: LearnerRaw = {
      ...orig,
      weekly_history: orig.weekly_history.map((h) => ({ ...h })),
    };

    // Kiểm tra và hiệu chỉnh quan hệ nộp trễ > nộp bài (STU007, STU034, STU060)
    // Quy tắc làm sạch đã công bố: Số bài nộp trễ không thể vượt quá tổng số bài đã nộp
    if (copy.late_submissions > copy.assignments_submitted) {
      const origLate = copy.late_submissions;
      changeLog.push({
        learner_id: copy.learner_id,
        field: 'late_submissions',
        original_value: origLate,
        cleaned_value: copy.assignments_submitted,
        reason: `Số bài nộp trễ (${origLate}) vượt quá số bài đã nộp (${copy.assignments_submitted}), điều chỉnh về ${copy.assignments_submitted}`,
      });
      copy.late_submissions = copy.assignments_submitted;
    }

    return copy;
  });

  return {
    cleanedLearners,
    changeLog,
    fixedIssuesCount: changeLog.length,
  };
}
