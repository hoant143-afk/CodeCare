import { TestCaseItem, ThresholdConfig, LearnerRaw } from '../types';
import { calculateDerivedLearner, computeAuditMetrics } from './analytics';
import { DEFAULT_THRESHOLDS } from '../data/seedData';
import { StorageService } from './storage';

export interface TestRunReport {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  executionTimeTotalMs: number;
  executedAt: string;
  results: TestCaseItem[];
}

export function runAutomatedTestSuites(
  learners: LearnerRaw[],
  activeThresholds: ThresholdConfig = DEFAULT_THRESHOLDS,
  existingTestCases?: TestCaseItem[]
): TestRunReport {
  const startTime = performance.now();
  const testResults: TestCaseItem[] = [];

  // Helper to run a test and capture execution time and failure message
  const executeTest = (
    id: string,
    title: string,
    category: string,
    input_data: string,
    action: string,
    expected_result: string,
    details: string,
    assertionFn: () => { pass: boolean; actual: string; error?: string }
  ) => {
    const t0 = performance.now();
    try {
      const outcome = assertionFn();
      const t1 = performance.now();
      testResults.push({
        id,
        title,
        category,
        test_type: 'AUTOMATED',
        input_data,
        action,
        expected_result,
        actual_result: outcome.actual,
        status: outcome.pass ? 'PASS' : 'FAIL',
        execution_time_ms: Number((t1 - t0).toFixed(2)),
        error_message: outcome.error,
        details,
      });
    } catch (err: any) {
      const t1 = performance.now();
      testResults.push({
        id,
        title,
        category,
        test_type: 'AUTOMATED',
        input_data,
        action,
        expected_result,
        actual_result: `Lỗi thực thi: ${err?.message || 'Uncaught error'}`,
        status: 'FAIL',
        execution_time_ms: Number((t1 - t0).toFixed(2)),
        error_message: err?.message,
        details,
      });
    }
  };

  // TC-01: Học sinh học tập bình thường không bị cảnh báo (STU001)
  const stu001 = learners.find((l) => l.learner_id === 'STU001');
  executeTest(
    'TC-01',
    'Học sinh học tập bình thường không bị cảnh báo',
    'Cảnh báo chuẩn',
    'STU001 (Submission 100%, Test pass 90%, Trễ 0, Chạy 22 lần, Lỗi 27%)',
    'Chạy thuật toán tính Evidence Score với ngưỡng chuẩn',
    'Evidence Score <= 2, alert_status = NORMAL, không có cảnh báo',
    'Đảm bảo hệ thống không tạo cảnh báo rác với các bạn đang tiến bộ tốt.',
    () => {
      if (!stu001) return { pass: false, actual: 'Không tìm thấy STU001 trong dữ liệu' };
      const derived = calculateDerivedLearner(stu001, activeThresholds);
      const pass = derived.evidence_score <= 2 && derived.alert_status === 'NORMAL';
      return {
        pass,
        actual: `Evidence Score = ${derived.evidence_score}, Trạng thái: ${derived.alert_status}`,
        error: pass ? undefined : 'Score vượt ngưỡng bình thường hoặc trạng thái sai',
      };
    }
  );

  // TC-02: Phát hiện học sinh nộp thiếu nhiều bài tập (STU002)
  const stu002 = learners.find((l) => l.learner_id === 'STU002');
  executeTest(
    'TC-02',
    'Phát hiện học sinh nộp thiếu nhiều bài tập',
    'Hành vi nộp bài',
    'STU002 (Bài nộp 3/6 = 50% < 70%, 2 bài trễ)',
    'Kiểm tra điều kiện submission_rate < 0.70 và late_submissions >= 2',
    'Cộng +2đ nộp thiếu (<0.70) và +1đ nộp trễ (>=2), lý do cảnh báo chứa thông tin nộp thiếu',
    'Lý do cảnh báo hiển thị rõ tỷ lệ nộp bài và số bài trễ.',
    () => {
      if (!stu002) return { pass: false, actual: 'Không tìm thấy STU002' };
      const derived = calculateDerivedLearner(stu002, activeThresholds);
      const hasSubmissionReason = derived.alert_reasons.some((r) => r.includes('Chỉ hoàn thành'));
      const hasLateReason = derived.alert_reasons.some((r) => r.includes('nộp trễ'));
      const pass = derived.submission_rate < activeThresholds.submissionRate && hasSubmissionReason && hasLateReason;
      return {
        pass,
        actual: `Submission rate: ${(derived.submission_rate * 100).toFixed(0)}%, Lý do: [${derived.alert_reasons.join('; ')}]`,
        error: pass ? undefined : 'Thiếu lý do cảnh báo nộp bài hoặc tỷ lệ tính sai',
      };
    }
  );

  // TC-03: Phát hiện tỷ lệ test pass case thấp (STU007)
  const stu007 = learners.find((l) => l.learner_id === 'STU007');
  executeTest(
    'TC-03',
    'Phát hiện tỷ lệ test pass case thấp',
    'Chất lượng lập trình',
    'STU007 (Pass rate 19% < 50%)',
    'Kiểm tra điều kiện test_pass_rate < 0.50',
    'Cộng +2đ kiểm thử thấp, lý do nêu rõ tỷ lệ vượt test dưới 50%',
    'Chỉ số kiểm thử phản ánh trực tiếp năng lực viết mã đáp ứng yêu cầu kỹ thuật.',
    () => {
      if (!stu007) return { pass: false, actual: 'Không tìm thấy STU007' };
      const derived = calculateDerivedLearner(stu007, activeThresholds);
      const hasPassReason = derived.alert_reasons.some((r) => r.includes('Tỷ lệ vượt qua kiểm thử'));
      const pass = derived.test_pass_rate < activeThresholds.testPassRate && hasPassReason;
      return {
        pass,
        actual: `Test pass rate: ${(derived.test_pass_rate * 100).toFixed(0)}%, Lý do: [${derived.alert_reasons.join('; ')}]`,
        error: pass ? undefined : 'Không kích hoạt quy tắc test pass thấp',
      };
    }
  );

  // TC-04: Chạy mã nhiều lần nhưng không cải thiện (STU003) - Sửa lỗi tính toán không nhất quán
  const stu003 = learners.find((l) => l.learner_id === 'STU003');
  executeTest(
    'TC-04',
    'Chạy mã nhiều lần nhưng không cải thiện (Debugging loop)',
    'Vòng lặp bế tắc',
    'STU003 (Code runs = 38 >= 15, Pass rate = 36% < 40%)',
    'Kiểm tra quy tắc code_runs >= 15 && test_pass_rate < 0.40',
    'Cộng +1đ bế tắc, tổng Evidence Score = 5 (Test low: +2, Error rate high: +1, Trend declining: +1, Debug loop: +1), alert_status = ALERT',
    'Đã hiệu chỉnh chính xác giá trị Evidence Score = 5 (thay vì 6 do STU003 nộp 5/6 bài = 83.3% > 70%).',
    () => {
      if (!stu003) return { pass: false, actual: 'Không tìm thấy STU003' };
      const derived = calculateDerivedLearner(stu003, activeThresholds);
      const hasLoopReason = derived.alert_reasons.some((r) => r.includes('bế tắc/thử-sai mù quáng'));
      const pass = derived.evidence_score === 5 && derived.alert_status === 'ALERT' && hasLoopReason;
      return {
        pass,
        actual: `Evidence Score = ${derived.evidence_score}, Alert Status = ${derived.alert_status}, Có lý do bế tắc: ${hasLoopReason ? 'Có' : 'Không'}`,
        error: pass ? undefined : `Điểm thực tế là ${derived.evidence_score} (kỳ vọng đúng 5)`,
      };
    }
  );

  // TC-05: Phát hiện ít hoạt động và vắng mặt (STU023)
  const stu023 = learners.find((l) => l.learner_id === 'STU023');
  executeTest(
    'TC-05',
    'Phát hiện ít hoạt động và vắng mặt',
    'Mức độ gắn kết',
    'STU023 (Active days = 1 <= 2 ngày, Login = 4 lần)',
    'Kiểm tra điều kiện active_days_7d <= 2',
    'Cộng +1đ gắn kết thấp, lý do nêu rõ số ngày hoạt động trong tuần',
    'Kịp thời nhắc nhở trước khi người học rơi vào tình trạng bỏ học (drop out).',
    () => {
      if (!stu023) return { pass: false, actual: 'Không tìm thấy STU023' };
      const derived = calculateDerivedLearner(stu023, activeThresholds);
      const hasActiveReason = derived.alert_reasons.some((r) => r.includes('Số ngày hoạt động'));
      const pass = stu023.active_days_7d <= activeThresholds.activeDays && hasActiveReason;
      return {
        pass,
        actual: `Active days: ${stu023.active_days_7d} ngày, Lý do kích hoạt: ${hasActiveReason ? 'Có' : 'Không'}`,
        error: pass ? undefined : 'Không ghi nhận lý do vắng mặt/hoạt động thấp',
      };
    }
  );

  // TC-06: Nộp trễ bài tập liên tiếp (STU010)
  const stu010 = learners.find((l) => l.learner_id === 'STU010');
  executeTest(
    'TC-06',
    'Nộp trễ bài tập liên tiếp',
    'Hành vi nộp bài',
    'STU010 (Late submissions = 2 >= 2)',
    'Kiểm tra ngưỡng nộp trễ lateCount >= 2',
    'Cộng +1đ nộp trễ, có lý do cảnh báo về bài nộp trễ',
    'Giúp giáo viên thăm dò khó khăn về thời gian hoặc khối lượng học tập.',
    () => {
      if (!stu010) return { pass: false, actual: 'Không tìm thấy STU010' };
      const derived = calculateDerivedLearner(stu010, activeThresholds);
      const hasLateReason = derived.alert_reasons.some((r) => r.includes('nộp trễ'));
      const pass = stu010.late_submissions >= activeThresholds.lateCount && hasLateReason;
      return {
        pass,
        actual: `Số bài trễ: ${stu010.late_submissions}, Có lý do trễ hạn: ${hasLateReason ? 'Có' : 'Không'}`,
        error: pass ? undefined : 'Không ghi nhận cảnh báo nộp trễ',
      };
    }
  );

  // TC-07: Xu hướng kết quả kiểm thử suy giảm (STU002)
  executeTest(
    'TC-07',
    'Xu hướng kết quả kiểm thử suy giảm (DECLINING)',
    'Xu hướng học tập',
    'STU002 (Previous test pass: 55%, Current test pass: 33%)',
    'So sánh current_test_pass_rate với previous_test_pass_rate',
    'Trend = DECLINING (chênh lệch <= -0.03), cộng +1đ dấu hiệu tụt lùi',
    'Phát hiện sớm người học từng học ổn nhưng bắt đầu gặp khó ở chủ đề mới.',
    () => {
      if (!stu002) return { pass: false, actual: 'Không tìm thấy STU002' };
      const derived = calculateDerivedLearner(stu002, activeThresholds);
      const pass = derived.progress_trend === 'DECLINING';
      return {
        pass,
        actual: `Previous: ${(stu002.previous_test_pass_rate * 100).toFixed(0)}%, Current: ${(stu002.current_test_pass_rate * 100).toFixed(0)}%, Trend: ${derived.progress_trend}`,
        error: pass ? undefined : `Trend thực tế là ${derived.progress_trend}`,
      };
    }
  );

  // TC-08: Phân tích trường hợp Cảnh báo Sai Dương (STU015)
  const stu015 = learners.find((l) => l.learner_id === 'STU015');
  executeTest(
    'TC-08',
    'Phân tích trường hợp Cảnh báo Sai Dương (False Positive)',
    'Audit & Đánh giá',
    'STU015 (Score = 5 >= 4 -> ALERT, nhưng teacher_label = NORMAL)',
    'Kiểm tra phân loại vào ô False Positive (FP) của ma trận nhầm lẫn',
    'Hệ thống sinh cảnh báo ALERT trong khi nhãn chuyên môn là NORMAL (FP)',
    'Giải thích: Học sinh tự viết mã thử nghiệm phức tạp, giáo viên nắm rõ nên không can thiệp.',
    () => {
      if (!stu015) return { pass: false, actual: 'Không tìm thấy STU015' };
      const derived = calculateDerivedLearner(stu015, activeThresholds);
      const pass = derived.alert_status === 'ALERT' && stu015.teacher_label === 'NORMAL';
      return {
        pass,
        actual: `Alert status: ${derived.alert_status}, Teacher label: ${stu015.teacher_label}`,
        error: pass ? undefined : 'STU015 không đáp ứng điều kiện False Positive',
      };
    }
  );

  // TC-09: Phân tích trường hợp Cảnh báo Sai Âm (STU048)
  const stu048 = learners.find((l) => l.learner_id === 'STU048');
  executeTest(
    'TC-09',
    'Phân tích trường hợp Cảnh báo Sai Âm (False Negative)',
    'Audit & Đánh giá',
    'STU048 (Score = 0 -> NORMAL, nhưng teacher_label = NEED_SUPPORT)',
    'Kiểm tra phân loại vào ô False Negative (FN) của ma trận nhầm lẫn',
    'Hệ thống phân loại NORMAL trong khi nhãn giáo viên là NEED_SUPPORT (FN)',
    'Giải thích: Học sinh nộp bài đủ trên web nhưng thực tế trên lớp bị phụ thuộc bạn cùng nhóm.',
    () => {
      if (!stu048) return { pass: false, actual: 'Không tìm thấy STU048' };
      const derived = calculateDerivedLearner(stu048, activeThresholds);
      const pass = derived.alert_status !== 'ALERT' && stu048.teacher_label === 'NEED_SUPPORT';
      return {
        pass,
        actual: `Alert status: ${derived.alert_status}, Teacher label: ${stu048.teacher_label}`,
        error: pass ? undefined : 'STU048 không đáp ứng điều kiện False Negative',
      };
    }
  );

  // TC-10: Đánh giá trạng thái WATCH khi Evidence Score đạt đúng 3 điểm (Tình huống kiểm thử riêng)
  executeTest(
    'TC-10',
    'Đánh giá trạng thái WATCH khi Evidence Score đạt đúng 3 điểm',
    'Quy tắc phân loại',
    'Hồ sơ giả lập biên: submission_rate = 0.50 (<0.70 -> +2đ), active_days_7d = 2 (<=2 -> +1đ), các chỉ số khác bình thường',
    'Chạy calculateDerivedLearner với hồ sơ biên',
    'Evidence Score = 3, alert_status = WATCH (Theo dõi thêm)',
    'Được xây dựng như tình huống kiểm thử riêng biệt để xác thực quy tắc WATCH mà không làm thay đổi 80 hồ sơ gốc.',
    () => {
      const syntheticWatchStudent: LearnerRaw = {
        learner_id: 'TEST_WATCH_01',
        class_name: 'LOP_A',
        week: 6,
        login_count_7d: 10,
        active_days_7d: 2, // +1 pt
        assignments_due: 6,
        assignments_submitted: 3, // 50% < 70% -> +2 pts
        late_submissions: 0,
        code_runs: 10,
        syntax_errors: 1,
        runtime_errors: 1,
        logic_errors: 1, // total 3/10 = 30% (<60%)
        tests_passed: 12,
        total_tests: 20, // 60% (>50%)
        average_score: 7.0,
        help_requests: 1,
        feedback_count: 2,
        previous_test_pass_rate: 0.60,
        current_test_pass_rate: 0.60, // STABLE
        teacher_label: 'NORMAL',
        weekly_history: [],
      };
      // Chạy theo đúng cấu hình ngưỡng benchmark yêu cầu (evidenceWatch = 3, evidenceAlert = 4)
      const derived = calculateDerivedLearner(syntheticWatchStudent, DEFAULT_THRESHOLDS);
      const pass = derived.evidence_score === 3 && derived.alert_status === 'WATCH';
      return {
        pass,
        actual: `Evidence Score = ${derived.evidence_score}, Alert Status = ${derived.alert_status} (với ngưỡng chuẩn: Watch=3, Alert=4)`,
        error: pass ? undefined : `Kỳ vọng Score = 3 và Status = WATCH, thực tế Score = ${derived.evidence_score}`,
      };
    }
  );

  // TC-11: Xử lý dữ liệu biên và mẫu số bằng 0 (Division by zero / Empty tests)
  executeTest(
    'TC-11',
    'Khả năng chống lỗi mẫu số bằng 0 và dữ liệu thiếu (Division by Zero Resilience)',
    'Ổn định hệ thống',
    'assignments_due = 0, code_runs = 0, total_tests = 0',
    'Tính các biến dẫn xuất submission_rate, error_rate, test_pass_rate',
    'Không phát sinh NaN hay Infinity, các tỷ lệ = 0, không bị phạt điểm nộp bài (due=0) hay test pass (tests=0), alert_status = NORMAL',
    'Đảm bảo hệ sinh thái toán học không bị crash và không phạt oan học sinh khi chưa giao bài hoặc chưa cấu hình test.',
    () => {
      const emptyStudent: LearnerRaw = {
        learner_id: 'TEST_ZERO_01',
        class_name: 'LOP_A',
        week: 1,
        login_count_7d: 0,
        active_days_7d: 0,
        assignments_due: 0,
        assignments_submitted: 0,
        late_submissions: 0,
        code_runs: 0,
        syntax_errors: 0,
        runtime_errors: 0,
        logic_errors: 0,
        tests_passed: 0,
        total_tests: 0,
        average_score: 0,
        help_requests: 0,
        feedback_count: 0,
        previous_test_pass_rate: 0,
        current_test_pass_rate: 0,
        teacher_label: 'NORMAL',
        weekly_history: [],
      };
      const derived = calculateDerivedLearner(emptyStudent, activeThresholds);
      const isFiniteSafe =
        Number.isFinite(derived.submission_rate) &&
        Number.isFinite(derived.error_rate) &&
        Number.isFinite(derived.test_pass_rate) &&
        !Number.isNaN(derived.submission_rate) &&
        !Number.isNaN(derived.error_rate) &&
        !Number.isNaN(derived.test_pass_rate);
      const notPenalized =
        !derived.alert_reasons.some((r) => r.includes('Chỉ hoàn thành')) &&
        !derived.alert_reasons.some((r) => r.includes('Tỷ lệ vượt qua kiểm thử')) &&
        derived.alert_status === 'NORMAL';
      const pass = isFiniteSafe && notPenalized;
      return {
        pass,
        actual: `submission_rate: ${derived.submission_rate}, test_pass_rate: ${derived.test_pass_rate}, evidence_score: ${derived.evidence_score}, alert_status: ${derived.alert_status}`,
        error: pass ? undefined : 'Phát hiện NaN, Infinity hoặc bị phạt sai quy tắc khi due=0 / tests=0',
      };
    }
  );

  // TC-12: Xử lý giá trị nằm chính xác tại ngưỡng (Boundary Threshold Values)
  executeTest(
    'TC-12',
    'Xử lý giá trị nằm chính xác tại ngưỡng (Boundary Threshold Values)',
    'Kiểm định biên',
    'submission_rate = 0.70, test_pass_rate = 0.50, error_rate = 0.60, late_submissions = 2, active_days_7d = 2',
    'Kiểm tra toán tử so sánh nghiêm ngặt (< vs <=, > vs >=)',
    'Các điều kiện nghiêm ngặt (<0.70, <0.50, >0.60) KHÔNG kích hoạt; các điều kiện (>=2, <=2) KÍCH HOẠT. Điểm = 2, alert_status = NORMAL',
    'Đảm bảo xử lý đúng học sinh nằm ngay mép ngưỡng mà không bị phạt oan.',
    () => {
      const boundaryStudent: LearnerRaw = {
        learner_id: 'TEST_BOUNDARY_01',
        class_name: 'LOP_B',
        week: 6,
        login_count_7d: 8,
        active_days_7d: 2, // <= 2 -> +1 pt
        assignments_due: 10,
        assignments_submitted: 7, // 7/10 = 0.70 (NOT < 0.70) -> 0 pts
        late_submissions: 2, // >= 2 -> +1 pt
        code_runs: 10,
        syntax_errors: 3,
        runtime_errors: 3,
        logic_errors: 0, // total 6/10 = 0.60 (NOT > 0.60) -> 0 pts
        tests_passed: 10,
        total_tests: 20, // 10/20 = 0.50 (NOT < 0.50) -> 0 pts
        average_score: 7.0,
        help_requests: 1,
        feedback_count: 2,
        previous_test_pass_rate: 0.50,
        current_test_pass_rate: 0.50, // STABLE -> 0 pts
        teacher_label: 'NORMAL',
        weekly_history: [],
      };
      // Chạy theo đúng cấu hình ngưỡng biên benchmark yêu cầu
      const derived = calculateDerivedLearner(boundaryStudent, DEFAULT_THRESHOLDS);
      // Expected score: +1 (active_days <= 2) + 1 (late >= 2) = 2 points -> NORMAL
      const pass = derived.evidence_score === 2 && derived.alert_status === 'NORMAL';
      return {
        pass,
        actual: `Evidence Score = ${derived.evidence_score}, Trạng thái: ${derived.alert_status} (với ngưỡng chuẩn: Sub=70%, Test=50%, Err=60%)`,
        error: pass ? undefined : `Kỳ vọng Score = 2, thực tế Score = ${derived.evidence_score}`,
      };
    }
  );

  // TC-13: Kiểm tra tính toàn vẹn sao lưu: Bắt lỗi bản ghi không hợp lệ ở cuối danh sách
  executeTest(
    'TC-13',
    'Kiểm tra tính toàn vẹn sao lưu: Bắt lỗi bản ghi không hợp lệ ở cuối danh sách',
    'An toàn dữ liệu',
    'Tệp JSON sao lưu gồm danh sách 80 học sinh hợp lệ và 1 bản ghi lỗi ở cuối (#81: learner_id bị rỗng)',
    'Gọi StorageService.previewBackup(json) và kiểm tra kết quả thẩm định toàn diện',
    'valid = false, phát hiện lỗi cụ thể tại bản ghi cuối cùng (#81), không thực hiện khôi phục',
    'Đảm bảo duyệt toàn bộ 100% hồ sơ trong tệp sao lưu thay vì chỉ kiểm tra 5 hồ sơ đầu.',
    () => {
      const corruptPayload = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        thresholds: activeThresholds,
        learners: [
          ...learners,
          {
            learner_id: '', // Empty ID at the very end (#81)
            class_name: 'LOP_A',
            week: 6,
            login_count_7d: 10,
            active_days_7d: 3,
            assignments_due: 6,
            assignments_submitted: 6,
            late_submissions: 0,
            code_runs: 10,
            syntax_errors: 1,
            runtime_errors: 1,
            logic_errors: 0,
            tests_passed: 10,
            total_tests: 10,
            average_score: 8.0,
            help_requests: 0,
            feedback_count: 0,
            previous_test_pass_rate: 0.8,
            current_test_pass_rate: 0.8,
            teacher_label: 'NORMAL',
            weekly_history: [],
          },
        ],
      };
      const preview = StorageService.previewBackup(JSON.stringify(corruptPayload));
      const pass = !preview.valid && (Boolean(preview.error?.includes('81')) || Boolean(preview.error?.includes('learner_id')));
      return {
        pass,
        actual: `valid: ${preview.valid}, Thông báo: "${preview.error}"`,
        error: pass ? undefined : 'previewBackup không bắt được lỗi tại bản ghi ở cuối danh sách',
      };
    }
  );

  // Manual UI Test Cases (Preserve PENDING until explicitly confirmed by user in UI)
  const existingM01 = existingTestCases?.find((t) => t.id === 'TC-M01');
  const isM01Confirmed = existingM01?.status === 'PASS';
  testResults.push({
    id: 'TC-M01',
    title: 'Kiểm thử Thủ công: Giáo viên xác nhận cảnh báo & lập can thiệp',
    category: 'Giao diện & Tương tác',
    test_type: 'MANUAL_UI',
    input_data: 'Bấm nút "Xác nhận cần hỗ trợ" tại hồ sơ STU023, nhập ghi chú và chọn hình thức can thiệp',
    action: 'Thực hiện thao tác trên modal hồ sơ học sinh và bấm "Lưu quyết định"',
    expected_result: 'Trạng thái chuyển thành CONFIRMED, lưu thời gian, đồng bộ vào danh sách Can thiệp và Nhật ký AI',
    actual_result: isM01Confirmed
      ? 'Đã được giáo viên/người dùng kiểm tra thực tế và xác nhận đạt yêu cầu'
      : 'Chờ người dùng thực hiện kiểm tra thực tế trên giao diện và bấm xác nhận',
    status: isM01Confirmed ? 'PASS' : 'PENDING',
    details: 'Được phân loại là kiểm thử giao diện thủ công (Human-in-the-loop validation). Chỉ chuyển PASS khi có thao tác xác nhận.',
  });

  const existingM02 = existingTestCases?.find((t) => t.id === 'TC-M02');
  const isM02Confirmed = existingM02?.status === 'PASS';
  testResults.push({
    id: 'TC-M02',
    title: 'Kiểm thử Thủ công: Giáo viên ghi đè/bác bỏ cảnh báo (Teacher Override)',
    category: 'Giao diện & Tương tác',
    test_type: 'MANUAL_UI',
    input_data: 'Bấm nút "Bác bỏ" / "Không cần can thiệp" đối với STU015 (False Positive)',
    action: 'Thực hiện thao tác bác bỏ trên thẻ cảnh báo hoặc modal hồ sơ',
    expected_result: 'Trạng thái chuyển thành DISMISSED, lưu vào nhật ký AI, không ép buộc can thiệp',
    actual_result: isM02Confirmed
      ? 'Đã được giáo viên/người dùng kiểm tra thực tế và xác nhận đạt yêu cầu'
      : 'Chờ người dùng thực hiện kiểm tra thực tế trên giao diện và bấm xác nhận',
    status: isM02Confirmed ? 'PASS' : 'PENDING',
    details: 'Đảm bảo quyền quyết định tối cao thuộc về giáo viên. Chỉ chuyển PASS khi có thao tác xác nhận.',
  });

  const endTime = performance.now();
  const passed = testResults.filter((t) => t.status === 'PASS').length;
  const failed = testResults.filter((t) => t.status === 'FAIL').length;
  const pending = testResults.filter((t) => t.status === 'PENDING').length;

  return {
    total: testResults.length,
    passed,
    failed,
    pending,
    executionTimeTotalMs: Number((endTime - startTime).toFixed(2)),
    executedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
    results: testResults,
  };
}
