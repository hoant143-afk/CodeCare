import { LearnerRaw, DataQualityReport, DataQualityIssue } from '../types';

export function validateLearnerDataset(learners: LearnerRaw[]): DataQualityReport {
  const issues: DataQualityIssue[] = [];
  const seenIds = new Set<string>();
  const invalidLearnerIds = new Set<string>();

  learners.forEach((l, index) => {
    let hasError = false;

    // 1. Kiểm tra ID rỗng hoặc trùng
    if (!l.learner_id || typeof l.learner_id !== 'string') {
      issues.push({
        learner_id: `Bản ghi #${index + 1}`,
        field: 'learner_id',
        issueType: 'MISSING_FIELD',
        description: 'Mã định danh người học bị trống hoặc không đúng định dạng',
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
    if (!['LOP_A', 'LOP_B', 'LOP_C'].includes(l.class_name)) {
      issues.push({
        learner_id: l.learner_id || `Bản ghi #${index + 1}`,
        field: 'class_name',
        issueType: 'OUT_OF_BOUNDS',
        description: `Lớp ${l.class_name} không thuộc danh mục hợp lệ (LOP_A, LOP_B, LOP_C)`,
      });
      hasError = true;
    }

    // 3. Kiểm tra số bài nộp và số bài được giao
    if (l.assignments_due < 0) {
      issues.push({
        learner_id: l.learner_id,
        field: 'assignments_due',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Số bài được giao có giá trị âm',
      });
      hasError = true;
    }
    if (l.assignments_submitted < 0) {
      issues.push({
        learner_id: l.learner_id,
        field: 'assignments_submitted',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Số bài đã nộp có giá trị âm',
      });
      hasError = true;
    }
    if (l.assignments_submitted > l.assignments_due) {
      issues.push({
        learner_id: l.learner_id,
        field: 'assignments_submitted',
        issueType: 'INVALID_RELATION',
        description: `Số bài đã nộp (${l.assignments_submitted}) lớn hơn tổng số bài được giao (${l.assignments_due})`,
      });
      hasError = true;
    }
    if (l.late_submissions < 0 || l.late_submissions > l.assignments_submitted) {
      issues.push({
        learner_id: l.learner_id,
        field: 'late_submissions',
        issueType: 'INVALID_RELATION',
        description: `Số bài nộp trễ (${l.late_submissions}) không hợp lý so với số bài đã nộp (${l.assignments_submitted})`,
      });
      hasError = true;
    }

    // 4. Kiểm tra test case
    if (l.total_tests < 0) {
      issues.push({
        learner_id: l.learner_id,
        field: 'total_tests',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Tổng số test case có giá trị âm',
      });
      hasError = true;
    }
    if (l.tests_passed < 0) {
      issues.push({
        learner_id: l.learner_id,
        field: 'tests_passed',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Số test case vượt qua có giá trị âm',
      });
      hasError = true;
    }
    if (l.tests_passed > l.total_tests) {
      issues.push({
        learner_id: l.learner_id,
        field: 'tests_passed',
        issueType: 'INVALID_RELATION',
        description: `Số test vượt qua (${l.tests_passed}) lớn hơn tổng số test (${l.total_tests})`,
      });
      hasError = true;
    }

    // 5. Kiểm tra ngày hoạt động và số lần chạy mã
    if (l.active_days_7d < 0 || l.active_days_7d > 7) {
      issues.push({
        learner_id: l.learner_id,
        field: 'active_days_7d',
        issueType: 'OUT_OF_BOUNDS',
        description: `Số ngày hoạt động (${l.active_days_7d}) phải trong khoảng 0 đến 7 ngày`,
      });
      hasError = true;
    }
    if (l.code_runs < 0) {
      issues.push({
        learner_id: l.learner_id,
        field: 'code_runs',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Số lần chạy code có giá trị âm',
      });
      hasError = true;
    }

    // 6. Kiểm tra tỷ lệ test pass trong khoảng [0, 1]
    if (l.previous_test_pass_rate < 0 || l.previous_test_pass_rate > 1) {
      issues.push({
        learner_id: l.learner_id,
        field: 'previous_test_pass_rate',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Tỷ lệ test pass tuần trước nằm ngoài khoảng [0, 1]',
      });
      hasError = true;
    }
    if (l.current_test_pass_rate < 0 || l.current_test_pass_rate > 1) {
      issues.push({
        learner_id: l.learner_id,
        field: 'current_test_pass_rate',
        issueType: 'OUT_OF_BOUNDS',
        description: 'Tỷ lệ test pass hiện tại nằm ngoài khoảng [0, 1]',
      });
      hasError = true;
    }

    // 7. Kiểm tra dữ liệu lịch sử theo tuần
    if (!Array.isArray(l.weekly_history) || l.weekly_history.length === 0) {
      issues.push({
        learner_id: l.learner_id,
        field: 'weekly_history',
        issueType: 'MISSING_FIELD',
        description: 'Thiếu mảng dữ liệu lịch sử theo tuần',
      });
      hasError = true;
    } else {
      l.weekly_history.forEach((h) => {
        if (h.test_pass_rate < 0 || h.test_pass_rate > 1 || h.code_runs < 0 || h.errors < 0) {
          issues.push({
            learner_id: l.learner_id,
            field: `weekly_history[w=${h.week}]`,
            issueType: 'OUT_OF_BOUNDS',
            description: `Dữ liệu lịch sử tuần ${h.week} chứa giá trị không hợp lệ`,
          });
          hasError = true;
        }
      });
    }

    if (hasError && l.learner_id) {
      invalidLearnerIds.add(l.learner_id);
    }
  });

  const totalRecords = learners.length;
  const invalidRecords = invalidLearnerIds.size;
  const validRecords = totalRecords - invalidRecords;

  return {
    totalRecords,
    validRecords,
    invalidRecords,
    issues,
    checkedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
  };
}
