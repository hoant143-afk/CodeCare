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
      is_sample: false,
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

  saveTestCases(cases: TestCaseItem[]): void {
    localStorage.setItem(KEYS.TEST_CASES, JSON.stringify(cases));
  },

  stopIntervention(learnerId: string, reason: string): void {
    const current = this.getTeacherReviews();
    const existing = current[learnerId] || {};
    current[learnerId] = {
      ...existing,
      intervention_status: 'STOPPED',
      notes: existing.notes ? `${existing.notes} | [DỪNG CAN THIỆP: ${reason}]` : `[DỪNG CAN THIỆP: ${reason}]`,
      timestamp: new Date().toLocaleString('vi-VN', { hour12: false }),
    };
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(current));
    this.addAuditLog({
      learner_id: learnerId,
      event_type: 'Dừng can thiệp',
      reasons: `Lý do dừng: ${reason}`,
      system_result: 'Can thiệp đã kết thúc',
      teacher_decision: 'Đã dừng theo dõi/can thiệp',
      notes: reason,
    });
  },

  createBackup(): string {
    const backupData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      thresholds: this.getThresholds(),
      reviews: this.getTeacherReviews(),
      learners: this.getLearnersRaw(),
      logs: this.getAuditLogs(),
      surveys: this.getTeacherSurveys(),
      test_cases: this.getTestCases(),
    };
    return JSON.stringify(backupData, null, 2);
  },

  previewBackup(jsonString: string): { valid: boolean; error?: string; summary?: any } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Tệp sao lưu không đúng định dạng JSON hợp lệ.' };
      }
      if (!Array.isArray(parsed.learners) || parsed.learners.length === 0) {
        return { valid: false, error: 'Tệp sao lưu thiếu danh sách người học (learners) hoặc danh sách rỗng.' };
      }
      return {
        valid: true,
        summary: {
          exported_at: parsed.exported_at || 'Không xác định',
          learners_count: parsed.learners?.length || 0,
          reviews_count: Object.keys(parsed.reviews || {}).length,
          logs_count: parsed.logs?.length || 0,
          surveys_count: parsed.surveys?.length || 0,
        },
      };
    } catch (e: any) {
      return { valid: false, error: `Lỗi đọc JSON: ${e.message}` };
    }
  },

  restoreBackup(jsonString: string): { success: boolean; message: string } {
    const preview = this.previewBackup(jsonString);
    if (!preview.valid) {
      return { success: false, message: preview.error || 'Dữ liệu sao lưu không hợp lệ.' };
    }
    try {
      // Save rollback slot before modifying
      const rollback = this.createBackup();
      localStorage.setItem('codecare_rollback_snapshot', rollback);

      const parsed = JSON.parse(jsonString);
      if (parsed.thresholds) localStorage.setItem(KEYS.THRESHOLDS, JSON.stringify(parsed.thresholds));
      if (parsed.reviews) localStorage.setItem(KEYS.REVIEWS, JSON.stringify(parsed.reviews));
      if (parsed.learners) localStorage.setItem(KEYS.LEARNERS, JSON.stringify(parsed.learners));
      if (parsed.logs) localStorage.setItem(KEYS.LOGS, JSON.stringify(parsed.logs));
      if (parsed.surveys) localStorage.setItem(KEYS.SURVEYS, JSON.stringify(parsed.surveys));
      if (parsed.test_cases) localStorage.setItem(KEYS.TEST_CASES, JSON.stringify(parsed.test_cases));

      this.addAuditLog({
        learner_id: 'SYSTEM',
        event_type: 'Khôi phục sao lưu',
        reasons: 'Người dùng nạp lại file sao lưu JSON',
        system_result: 'Khôi phục thành công',
        teacher_decision: 'Đã khôi phục dữ liệu',
        notes: `Nạp lại ${parsed.learners.length} học viên từ bản sao lưu ngày ${parsed.exported_at || 'N/A'}.`,
      });

      return { success: true, message: `Khôi phục thành công ${parsed.learners.length} học viên!` };
    } catch (e: any) {
      return { success: false, message: `Lỗi khi khôi phục: ${e.message}` };
    }
  },

  rollback(): { success: boolean; message: string } {
    try {
      const rollbackData = localStorage.getItem('codecare_rollback_snapshot');
      if (!rollbackData) {
        return { success: false, message: 'Không tìm thấy điểm khôi phục (snapshot) trước đó.' };
      }
      return this.restoreBackup(rollbackData);
    } catch (e: any) {
      return { success: false, message: `Lỗi rollback: ${e.message}` };
    }
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

