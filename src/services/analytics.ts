import {
  LearnerRaw,
  LearnerDerived,
  ThresholdConfig,
  AuditMetric,
  ThresholdSimulationPoint,
  TeacherConfirmation,
  InterventionStatus,
  SupportSituation,
} from '../types';

export function determineSupportSituation(learner: {
  submission_rate: number;
  active_days_7d: number;
  code_runs: number;
  test_pass_rate: number;
  progress_trend: string;
}): SupportSituation {
  if (learner.submission_rate < 0.70 || learner.active_days_7d <= 2) {
    return 'Ít hoạt động hoặc chưa hoàn thành bài';
  }
  if (learner.code_runs >= 15 && learner.test_pass_rate < 0.50) {
    return 'Chạy mã nhiều lần nhưng vượt ít bài kiểm thử';
  }
  if (learner.progress_trend === 'DECLINING') {
    return 'Kết quả lập trình suy giảm';
  }
  return 'Hỗ trợ tổng hợp';
}

export function calculateDerivedLearner(
  raw: LearnerRaw,
  thresholds: ThresholdConfig,
  review?: {
    confirmation: TeacherConfirmation;
    timestamp?: string;
    notes?: string;
    intervention_type?: any;
    intervention_situation?: SupportSituation;
    intervention_status?: InterventionStatus;
    intervention_date?: string;
    intervention_outcome?: string;
  }
): LearnerDerived {
  // Safe ratios with zero denominator handling
  const due = Number.isFinite(raw.assignments_due) && raw.assignments_due > 0 ? raw.assignments_due : 0;
  const submitted = Number.isFinite(raw.assignments_submitted) && raw.assignments_submitted >= 0 ? raw.assignments_submitted : 0;
  const late = Number.isFinite(raw.late_submissions) && raw.late_submissions >= 0 ? raw.late_submissions : 0;
  const runs = Number.isFinite(raw.code_runs) && raw.code_runs >= 0 ? raw.code_runs : 0;
  const totalTests = Number.isFinite(raw.total_tests) && raw.total_tests > 0 ? raw.total_tests : 0;
  const passedTests = Number.isFinite(raw.tests_passed) && raw.tests_passed >= 0 ? raw.tests_passed : 0;

  const syntaxErrors = Number.isFinite(raw.syntax_errors) && raw.syntax_errors >= 0 ? raw.syntax_errors : 0;
  const runtimeErrors = Number.isFinite(raw.runtime_errors) && raw.runtime_errors >= 0 ? raw.runtime_errors : 0;
  const logicErrors = Number.isFinite(raw.logic_errors) && raw.logic_errors >= 0 ? raw.logic_errors : 0;
  const total_errors = syntaxErrors + runtimeErrors + logicErrors;

  const submission_rate = due > 0 ? Math.max(0, Math.min(1, submitted / due)) : 0;
  const late_rate = due > 0 ? Math.max(0, Math.min(1, late / due)) : 0;
  const test_pass_rate = totalTests > 0 ? Math.max(0, Math.min(1, passedTests / totalTests)) : 0;
  const error_rate = runs > 0 ? Math.max(0, total_errors / runs) : 0;

  // Activity level calculation based on login and active days
  let activity_level: 'Cao' | 'Trung bình' | 'Thấp' = 'Trung bình';
  const loginCount = Number.isFinite(raw.login_count_7d) ? raw.login_count_7d : 0;
  const activeDays = Number.isFinite(raw.active_days_7d) ? raw.active_days_7d : 0;

  if (loginCount >= 12 && activeDays >= 4) {
    activity_level = 'Cao';
  } else if (loginCount <= 5 || activeDays <= 2) {
    activity_level = 'Thấp';
  }

  // Progress trend: compare current vs previous test pass rate safely
  let progress_trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
  const prevPass = Number.isFinite(raw.previous_test_pass_rate) ? raw.previous_test_pass_rate : test_pass_rate;
  const currPass = Number.isFinite(raw.current_test_pass_rate) ? raw.current_test_pass_rate : test_pass_rate;
  const passDiff = currPass - prevPass;

  if (passDiff >= 0.03) {
    progress_trend = 'IMPROVING';
  } else if (passDiff <= -0.03) {
    progress_trend = 'DECLINING';
  }

  // Evidence score calculation with explicit boundary compliance
  let evidence_score = 0;
  const alert_reasons: string[] = [];

  // Quy tắc 1: Tỷ lệ hoàn thành nhiệm vụ < ngưỡng (Mặc định 0.70) - Chỉ áp dụng khi có bài được giao (due > 0)
  if (due > 0 && submission_rate < thresholds.submissionRate) {
    evidence_score += 2;
    alert_reasons.push(
      `Chỉ hoàn thành ${Math.round(submission_rate * 100)}% bài được giao (${submitted}/${due} bài)`
    );
  }

  // Quy tắc 2: Tỷ lệ kiểm thử đạt < ngưỡng (Mặc định 0.50) - Chỉ áp dụng khi có bộ kiểm thử (totalTests > 0)
  if (totalTests > 0 && test_pass_rate < thresholds.testPassRate) {
    evidence_score += 2;
    alert_reasons.push(
      `Tỷ lệ vượt qua kiểm thử đạt ${Math.round(test_pass_rate * 100)}% (dưới ngưỡng tối thiểu ${Math.round(thresholds.testPassRate * 100)}%)`
    );
  }

  // Quy tắc 3: Số bài nộp trễ >= ngưỡng (Mặc định >= 2)
  if (late >= thresholds.lateCount) {
    evidence_score += 1;
    alert_reasons.push(
      `${late} bài gần nhất nộp trễ so với hạn chót quy định`
    );
  }

  // Quy tắc 4: Tỷ lệ lỗi trên tổng lần chạy > ngưỡng (Mặc định > 0.60) - Chỉ áp dụng khi có chạy mã (runs > 0)
  if (runs > 0 && error_rate > thresholds.errorRate) {
    evidence_score += 1;
    alert_reasons.push(
      `Tỷ lệ gặp lỗi cao (${Math.round(error_rate * 100)}% trên tổng số lần chạy mã, ${total_errors} lỗi / ${runs} lần)`
    );
  }

  // Quy tắc 5: Số ngày hoạt động trong tuần <= ngưỡng (Mặc định <= 2)
  if (activeDays <= thresholds.activeDays) {
    evidence_score += 1;
    alert_reasons.push(
      `Số ngày hoạt động trong 7 ngày qua rất ít (${activeDays} ngày, ${loginCount} lượt đăng nhập)`
    );
  }

  // Quy tắc 6: Xu hướng kết quả kiểm thử suy giảm
  if (progress_trend === 'DECLINING') {
    evidence_score += 1;
    alert_reasons.push(
      `Kết quả kiểm thử có xu hướng giảm liên tục (${Math.round(prevPass * 100)}% xuống ${Math.round(currPass * 100)}%)`
    );
  }

  // Quy tắc 7: Vòng lặp bế tắc - chạy mã nhiều lần (>=15) nhưng tỷ lệ test đạt thấp (<40%)
  if (runs >= thresholds.highRunThreshold && test_pass_rate < thresholds.lowPassWithHighRun) {
    evidence_score += 1;
    alert_reasons.push(
      `Đã chạy chương trình ${runs} lần nhưng chỉ vượt ${Math.round(test_pass_rate * 100)}% bộ kiểm thử (dấu hiệu bế tắc/thử-sai mù quáng)`
    );
  }

  // Phân cấp trạng thái theo ngưỡng Evidence Score
  let alert_status: 'ALERT' | 'WATCH' | 'NORMAL' = 'NORMAL';
  if (evidence_score >= thresholds.evidenceAlert) {
    alert_status = 'ALERT';
  } else if (evidence_score >= thresholds.evidenceWatch) {
    alert_status = 'WATCH';
  }

  const defaultSituation = determineSupportSituation({
    submission_rate,
    active_days_7d: activeDays,
    code_runs: runs,
    test_pass_rate,
    progress_trend,
  });

  return {
    ...raw,
    submission_rate,
    late_rate,
    test_pass_rate,
    total_errors,
    error_rate,
    activity_level,
    progress_trend,
    evidence_score,
    alert_status,
    alert_reasons,
    teacher_confirmation: review?.confirmation || 'UNREVIEWED',
    confirmation_timestamp: review?.timestamp,
    teacher_notes: review?.notes,
    intervention_type: review?.intervention_type,
    intervention_situation: review?.intervention_situation || defaultSituation,
    intervention_status: review?.intervention_status || 'NONE',
    intervention_date: review?.intervention_date,
    intervention_outcome: review?.intervention_outcome,
  };
}

/**
 * Kiểm tra xem cảnh báo đã có hành động can thiệp sư phạm thực tế hay chưa.
 * Trạng thái CONFIRMED hoặc PENDING đơn thuần KHÔNG được tính là đã thực thi can thiệp.
 * Trạng thái STOPPED chỉ tính khi có bằng chứng/ghi chú kết quả can thiệp đi kèm.
 */
export function isInterventionExecuted(learner: LearnerDerived): boolean {
  const status = learner.intervention_status;
  if (!status || status === 'NONE' || status === 'PENDING') {
    return false;
  }
  if (status === 'COMPLETED') {
    return true;
  }
  if (status === 'IN_PROGRESS') {
    return Boolean(
      learner.intervention_type &&
        (learner.intervention_date || (learner.teacher_notes && learner.teacher_notes.trim().length > 0))
    );
  }
  if (status === 'STOPPED') {
    return Boolean(
      learner.intervention_outcome && learner.intervention_outcome.trim().length > 0
    );
  }
  return false;
}

export function computeAuditMetrics(learners: LearnerDerived[]): AuditMetric {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  let totalAlerts = 0;
  let actionableInterventions = 0;

  for (const learner of learners) {
    const isAlert = learner.alert_status === 'ALERT';
    const isNeedSupport = learner.teacher_label === 'NEED_SUPPORT';

    if (isAlert) {
      totalAlerts++;
      // Chỉ tính là can thiệp khi có bằng chứng thực thi hành động can thiệp thực tế
      if (isInterventionExecuted(learner)) {
        actionableInterventions++;
      }
    }

    if (isAlert && isNeedSupport) {
      tp++;
    } else if (isAlert && !isNeedSupport) {
      fp++;
    } else if (!isAlert && !isNeedSupport) {
      tn++;
    } else if (!isAlert && isNeedSupport) {
      fn++;
    }
  }

  const total = learners.length || 1;
  const accuracy = (tp + tn) / total;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const actionableRate = totalAlerts > 0 ? actionableInterventions / totalAlerts : 0;

  return {
    tp,
    fp,
    tn,
    fn,
    accuracy,
    precision,
    recall,
    f1,
    totalAlerts,
    actionableRate,
  };
}

export function simulateThresholds(
  rawList: LearnerRaw[],
  baseThresholds: ThresholdConfig,
  reviews: Record<string, any>
): ThresholdSimulationPoint[] {
  const points: ThresholdSimulationPoint[] = [];
  const testScores = [3, 4, 5, 6];

  for (const threshold of testScores) {
    const config: ThresholdConfig = {
      ...baseThresholds,
      evidenceAlert: threshold,
    };
    const derived = rawList.map((r) => calculateDerivedLearner(r, config, reviews[r.learner_id]));
    const metrics = computeAuditMetrics(derived);
    points.push({
      threshold,
      precision: Number((metrics.precision * 100).toFixed(1)),
      recall: Number((metrics.recall * 100).toFixed(1)),
      alertCount: metrics.totalAlerts,
      accuracy: Number((metrics.accuracy * 100).toFixed(1)),
      tp: metrics.tp,
      fp: metrics.fp,
      tn: metrics.tn,
      fn: metrics.fn,
    });
  }

  return points;
}

export interface SubgroupAudit {
  groupName: string;
  count: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  precision: number;
  recall: number;
  fpr: number; // False Positive Rate = FP / (FP + TN)
  isSampleSmall: boolean; // Flag if N < 10
}

export function computeFairnessAudit(learners: LearnerDerived[]): {
  byClass: SubgroupAudit[];
  byActivity: SubgroupAudit[];
  byCompleteness: SubgroupAudit[];
} {
  const calcGroup = (groupName: string, items: LearnerDerived[]): SubgroupAudit => {
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;
    for (const l of items) {
      const isAlert = l.alert_status === 'ALERT';
      const isNeedSupport = l.teacher_label === 'NEED_SUPPORT';
      if (isAlert && isNeedSupport) tp++;
      else if (isAlert && !isNeedSupport) fp++;
      else if (!isAlert && !isNeedSupport) tn++;
      else if (!isAlert && isNeedSupport) fn++;
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
    return {
      groupName,
      count: items.length,
      tp,
      fp,
      tn,
      fn,
      precision,
      recall,
      fpr,
      isSampleSmall: items.length < 10,
    };
  };

  const byClass = [
    calcGroup('Lớp A (LOP_A)', learners.filter((l) => l.class_name === 'LOP_A')),
    calcGroup('Lớp B (LOP_B)', learners.filter((l) => l.class_name === 'LOP_B')),
    calcGroup('Lớp C (LOP_C)', learners.filter((l) => l.class_name === 'LOP_C')),
  ];

  const byActivity = [
    calcGroup('Hoạt động Cao', learners.filter((l) => l.activity_level === 'Cao')),
    calcGroup('Hoạt động Trung bình', learners.filter((l) => l.activity_level === 'Trung bình')),
    calcGroup('Hoạt động Thấp', learners.filter((l) => l.activity_level === 'Thấp')),
  ];

  const byCompleteness = [
    calcGroup('Dữ liệu Đầy đủ (>=5 bài nộp)', learners.filter((l) => l.assignments_submitted >= 5)),
    calcGroup('Dữ liệu Thiếu một phần (<5 bài nộp)', learners.filter((l) => l.assignments_submitted < 5)),
  ];

  return { byClass, byActivity, byCompleteness };
}
