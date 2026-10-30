import {
  ThresholdConfig,
  LearnerRaw,
  TeacherSurveyResponse,
  TestCaseItem,
  AuditLogItem,
} from '../types';
import {
  DEFAULT_THRESHOLDS,
  SEED_LEARNERS,
  INITIAL_TEACHER_REVIEWS,
  SEED_SURVEYS,
  SEED_TEST_CASES,
} from '../data/seedData';

const KEYS = {
  THRESHOLDS: 'codecare_thresholds_v1',
  REVIEWS: 'codecare_reviews_v1',
  LEARNERS: 'codecare_learners_v1',
  LOGS: 'codecare_audit_logs_v1',
  SURVEYS: 'codecare_surveys_v1',
  TEST_CASES: 'codecare_test_cases_v1',
};

export const StorageService = {
  getThresholds(): ThresholdConfig {
    try {
      const data = localStorage.getItem(KEYS.THRESHOLDS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_THRESHOLDS;
  },

  saveThresholds(config: ThresholdConfig): void {
    localStorage.setItem(KEYS.THRESHOLDS, JSON.stringify(config));
  },

  resetThresholds(): ThresholdConfig {
    localStorage.setItem(KEYS.THRESHOLDS, JSON.stringify(DEFAULT_THRESHOLDS));
    return DEFAULT_THRESHOLDS;
  },

  getTeacherReviews(): Record<string, any> {
    try {
      const data = localStorage.getItem(KEYS.REVIEWS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TEACHER_REVIEWS;
  },

  saveTeacherReview(learnerId: string, review: any): void {
    const current = this.getTeacherReviews();
    current[learnerId] = {
      ...current[learnerId],
      ...review,
      timestamp: new Date().toLocaleString('vi-VN', { hour12: false }),
    };
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(current));
  },

  getLearnersRaw(): LearnerRaw[] {
    try {
      const data = localStorage.getItem(KEYS.LEARNERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return SEED_LEARNERS;
  },

  saveLearnersRaw(learners: LearnerRaw[]): void {
    localStorage.setItem(KEYS.LEARNERS, JSON.stringify(learners));
  },

  getAuditLogs(): AuditLogItem[] {
    try {
      const data = localStorage.getItem(KEYS.LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    // Default initial logs
    return [
      {
        id: 'LOG-001',
        timestamp: '2026-10-11 08:00',
        learner_id: 'STU023',
        event_type: 'GV xác nhận cần hỗ trợ',
        reasons: 'Test pass thấp (29%) + 2 bài nộp trễ',
        system_result: 'Có dấu hiệu cần hỗ trợ (Score 5)',
        teacher_decision: 'GV xác nhận cần hỗ trợ',
        notes: 'Chuẩn bị phiên 1-on-1 trước buổi lab tuần 7.',
      },
      {
        id: 'LOG-002',
        timestamp: '2026-10-10 14:30',
        learner_id: 'STU002',
        event_type: 'Cập nhật can thiệp',
        reasons: 'Nộp thiếu bài và tỷ lệ test giảm (DECLINING)',
        system_result: 'Có dấu hiệu cần hỗ trợ (Score 6)',
        teacher_decision: 'GV xác nhận cần hỗ trợ',
        notes: 'Đã hướng dẫn cấu hình GCC compiler, đang làm lại bài lab 5.',
      },
      {
        id: 'LOG-003',
        timestamp: '2026-10-10 11:00',
        learner_id: 'STU015',
        event_type: 'GV bác bỏ cảnh báo',
        reasons: 'Chạy mã nhiều lần với lỗi thử nghiệm',
        system_result: 'Có dấu hiệu cần hỗ trợ (Score 4)',
        teacher_decision: 'Không cần can thiệp',
        notes: 'Học sinh đang viết module đồ họa nâng cao, nắm chắc kiến thức cơ bản.',
      },
      {
        id: 'LOG-004',
        timestamp: '2026-10-09 16:15',
        learner_id: 'STU003',
        event_type: 'Cập nhật can thiệp',
        reasons: 'Vòng lặp lỗi logic con trỏ (38 lần chạy)',
        system_result: 'Có dấu hiệu cần hỗ trợ (Score 6)',
        teacher_decision: 'GV xác nhận cần hỗ trợ',
        notes: 'Đã giao 3 bài tập nhỏ minh họa cấp phát động.',
      },
    ];
  },

  addAuditLog(item: Omit<AuditLogItem, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLogItem = {
      ...item,
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('vi-VN', { hour12: false }),
    };
    logs.unshift(newLog);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 50)));
  },

  getTeacherSurveys(): TeacherSurveyResponse[] {
    try {
      const data = localStorage.getItem(KEYS.SURVEYS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return SEED_SURVEYS;
  },

  addTeacherSurvey(survey: Omit<TeacherSurveyResponse, 'id' | 'created_at'>): void {
    const surveys = this.getTeacherSurveys();
    const newSurvey: TeacherSurveyResponse = {
      ...survey,
      id: `SURV_${(surveys.length + 1).toString().padStart(2, '0')}`,
      created_at: new Date().toLocaleString('vi-VN', { hour12: false }),
    };
    surveys.unshift(newSurvey);
    localStorage.setItem(KEYS.SURVEYS, JSON.stringify(surveys));
  },

  getTestCases(): TestCaseItem[] {
    try {
      const data = localStorage.getItem(KEYS.TEST_CASES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return SEED_TEST_CASES;
  },

  resetDemoData(): void {
    localStorage.setItem(KEYS.THRESHOLDS, JSON.stringify(DEFAULT_THRESHOLDS));
    localStorage.setItem(KEYS.LEARNERS, JSON.stringify(SEED_LEARNERS));
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(INITIAL_TEACHER_REVIEWS));
    localStorage.setItem(KEYS.SURVEYS, JSON.stringify(SEED_SURVEYS));
    localStorage.setItem(KEYS.TEST_CASES, JSON.stringify(SEED_TEST_CASES));
    // Reset initial logs
    const initialLogs: AuditLogItem[] = [
      {
        id: 'LOG-001',
        timestamp: '2026-10-11 08:00',
        learner_id: 'STU023',
        event_type: 'GV xác nhận cần hỗ trợ',
        reasons: 'Test pass thấp (29%) + 2 bài nộp trễ',
        system_result: 'Có dấu hiệu cần hỗ trợ (Score 5)',
        teacher_decision: 'GV xác nhận cần hỗ trợ',
        notes: 'Chuẩn bị phiên 1-on-1 trước buổi lab tuần 7.',
      },
    ];
    localStorage.setItem(KEYS.LOGS, JSON.stringify(initialLogs));
  },
};
