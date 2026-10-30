import {
  LearnerRaw,
  LearnerDerived,
  ThresholdConfig,
  AuditMetric,
  ThresholdSimulationPoint,
  TeacherConfirmation,
  InterventionStatus
} from '../types';

export function calculateDerivedLearner(
  raw: LearnerRaw,
  thresholds: ThresholdConfig,
  review?: {
    confirmation: TeacherConfirmation;
    timestamp?: string;
    notes?: string;
    intervention_type?: any;
    intervention_status?: InterventionStatus;
    intervention_date?: string;
    intervention_outcome?: string;
  }
): LearnerDerived {
  const submission_rate = raw.assignments_due > 0 ? raw.assignments_submitted / raw.assignments_due : 0;
  const late_rate = raw.assignments_due > 0 ? raw.late_submissions / raw.assignments_due : 0;
  const test_pass_rate = raw.total_tests > 0 ? raw.tests_passed / raw.total_tests : 0;
  const total_errors = raw.syntax_errors + raw.runtime_errors + raw.logic_errors;
  const error_rate = raw.code_runs > 0 ? total_errors / raw.code_runs : 0;

  // Activity level
  let activity_level: 'Cao' | 'Trung bình' | 'Thấp' = 'Trung bình';
  if (raw.login_count_7d >= 12 && raw.active_days_7d >= 4) {
    activity_level = 'Cao';
  } else if (raw.login_count_7d <= 5 || raw.active_days_7d <= 2) {
    activity_level = 'Thấp';
  }

  // Progress trend
  let progress_trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
  const passDiff = raw.current_test_pass_rate - raw.previous_test_pass_rate;
  if (passDiff >= 0.03) {
    progress_trend = 'IMPROVING';
  } else if (passDiff <= -0.03) {
    progress_trend = 'DECLINING';
  }

  // Evidence score calculation & explainable reasons
  let evidence_score = 0;
  const alert_reasons: string[] = [];

  if (submission_rate < thresholds.submissionRate) {
    evidence_score += 2;
    alert_reasons.push(
      `Chỉ hoàn thành ${Math.round(submission_rate * 100)}% bài được giao (${raw.assignments_submitted}/${raw.assignments_due} bài)`
    );
  }

  if (test_pass_rate < thresholds.testPassRate) {
    evidence_score += 2;
    alert_reasons.push(
      `Tỷ lệ vượt qua kiểm thử đạt ${Math.round(test_pass_rate * 100)}% (dưới ngưỡng tối thiểu ${Math.round(thresholds.testPassRate * 100)}%)`
    );
  }

  if (raw.late_submissions >= thresholds.lateCount) {
    evidence_score += 1;
    alert_reasons.push(
      `${raw.late_submissions} bài gần nhất nộp trễ so với hạn chót quy định`
    );
  }

  if (error_rate > thresholds.errorRate) {
    evidence_score += 1;
    alert_reasons.push(
      `Tỷ lệ gặp lỗi cao (${Math.round(error_rate * 100)}% trên tổng số lần chạy mã, ${total_errors} lỗi / ${raw.code_runs} lần)`
    );
  }

  if (raw.active_days_7d <= thresholds.activeDays) {
    evidence_score += 1;
    alert_reasons.push(
      `Số ngày hoạt động trong 7 ngày qua rất ít (${raw.active_days_7d} ngày, ${raw.login_count_7d} lượt đăng nhập)`
    );
  }

  if (progress_trend === 'DECLINING') {
    evidence_score += 1;
    alert_reasons.push(
      `Kết quả kiểm thử có xu hướng giảm liên tục (${Math.round(raw.previous_test_pass_rate * 100)}% xuống ${Math.round(raw.current_test_pass_rate * 100)}%)`
    );
  }

  if (raw.code_runs >= thresholds.highRunThreshold && test_pass_rate < thresholds.lowPassWithHighRun) {
    evidence_score += 1;
    alert_reasons.push(
      `Đã chạy chương trình ${raw.code_runs} lần nhưng chỉ vượt ${Math.round(test_pass_rate * 100)}% bộ kiểm thử (dấu hiệu bế tắc/thử-sai mù quáng)`
    );
  }

  // Determine status
  let alert_status: 'ALERT' | 'WATCH' | 'NORMAL' = 'NORMAL';
  if (evidence_score >= thresholds.evidenceAlert) {
    alert_status = 'ALERT';
  } else if (evidence_score >= thresholds.evidenceWatch) {
    alert_status = 'WATCH';
  }

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
    intervention_status: review?.intervention_status || 'NONE',
    intervention_date: review?.intervention_date,
    intervention_outcome: review?.intervention_outcome,
  };
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
      if (learner.teacher_confirmation === 'CONFIRMED' || learner.intervention_status !== 'NONE') {
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
