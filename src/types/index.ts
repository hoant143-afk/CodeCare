export type ClassName = 'LOP_A' | 'LOP_B' | 'LOP_C';

export type ActivityLevel = 'Cao' | 'Trung bình' | 'Thấp';

export type ProgressTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';

export type TeacherLabel = 'NEED_SUPPORT' | 'NORMAL';

export type AlertStatus = 'ALERT' | 'WATCH' | 'NORMAL';

export type TeacherConfirmation = 'UNREVIEWED' | 'CONFIRMED' | 'WATCHING' | 'DISMISSED';

export type InterventionStatus = 'NONE' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type InterventionType = 
  | 'Hỗ trợ trực tiếp'
  | 'Gợi ý từng bước'
  | 'Giao bài bổ trợ'
  | 'Nhắc tiến độ'
  | 'Theo dõi thêm'
  | 'Trao đổi cá nhân'
  | 'Khác';

export interface WeeklyHistory {
  week: number;
  test_pass_rate: number;
  code_runs: number;
  errors: number;
  assignments_submitted: number;
}

export interface LearnerRaw {
  learner_id: string; // STU001 - STU080
  class_name: ClassName;
  week: number;
  login_count_7d: number;
  active_days_7d: number;
  assignments_due: number;
  assignments_submitted: number;
  late_submissions: number;
  code_runs: number;
  syntax_errors: number;
  runtime_errors: number;
  logic_errors: number;
  tests_passed: number;
  total_tests: number;
  average_score: number;
  help_requests: number;
  feedback_count: number;
  previous_test_pass_rate: number;
  current_test_pass_rate: number;
  teacher_label: TeacherLabel; // Ground truth
  weekly_history: WeeklyHistory[];
  notes?: string;
}

export interface LearnerDerived extends LearnerRaw {
  submission_rate: number;
  late_rate: number;
  test_pass_rate: number;
  total_errors: number;
  error_rate: number;
  activity_level: ActivityLevel;
  progress_trend: ProgressTrend;
  evidence_score: number;
  alert_status: AlertStatus;
  alert_reasons: string[];
  teacher_confirmation: TeacherConfirmation;
  confirmation_timestamp?: string;
  teacher_notes?: string;
  intervention_type?: InterventionType;
  intervention_status: InterventionStatus;
  intervention_date?: string;
  intervention_outcome?: string;
}

export interface ThresholdConfig {
  submissionRate: number; // e.g. 0.70
  testPassRate: number;   // e.g. 0.50
  lateCount: number;       // e.g. 2
  errorRate: number;       // e.g. 0.60
  activeDays: number;      // e.g. 2
  evidenceWatch: number;   // e.g. 3
  evidenceAlert: number;   // e.g. 4
  highRunThreshold: number; // e.g. 15
  lowPassWithHighRun: number; // e.g. 0.40
}

export interface AuditMetric {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  totalAlerts: number;
  actionableRate: number;
}

export interface ThresholdSimulationPoint {
  threshold: number;
  precision: number;
  recall: number;
  alertCount: number;
  accuracy: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  learner_id: string;
  event_type: 'Cảnh báo được sinh' | 'GV xác nhận cần hỗ trợ' | 'GV theo dõi thêm' | 'GV bác bỏ cảnh báo' | 'Cập nhật can thiệp' | 'Thay đổi ngưỡng';
  reasons: string;
  system_result: string;
  teacher_decision: string;
  notes: string;
}

export interface TeacherSurveyResponse {
  id: string;
  teacher_name: string;
  subject: string;
  created_at: string;
  q1_easy_to_use: number;       // 1-5
  q2_indicators_clear: number;  // 1-5
  q3_reasons_clear: number;      // 1-5
  q4_helps_identify: number;     // 1-5
  q5_realistic_interventions: number; // 1-5
  q6_no_stigmatization: number;  // 1-5
  q7_would_use_in_practice: number; // 1-5
  most_useful_indicator: string;
  unreasonable_alert: string;
  needed_information: string;
  suggestions: string;
}

export interface TestCaseItem {
  id: string;
  title: string;
  category: string;
  input_data: string;
  action: string;
  expected_result: string;
  actual_result: string;
  status: 'PASS' | 'FAIL';
  details: string;
}
