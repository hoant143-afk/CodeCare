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
    const uniqueSuffix = `${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const newLog: AuditLogItem = {
      ...item,
      id: `LOG-${uniqueSuffix}`,
      timestamp: new Date().toLocaleString('vi-VN', { hour12: false }),
    };
    logs.unshift(newLog);
    // Không cắt ngắn .slice(0, 50) để bảo toàn đầy đủ lịch sử audit log
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  getTeacherSurveys(): TeacherSurveyResponse[] {
    try {
      const data = localStorage.getItem(KEYS.SURVEYS);
      if (data) {
        const parsed: TeacherSurveyResponse[] = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((s) => ({
            ...s,
            // Bảo đảm dữ liệu khảo sát mẫu đã lưu từ phiên bản cũ không bị hiểu nhầm thành phản hồi thực tế
            is_sample:
              s.is_sample === true ||
              s.id === 'SURV_01' ||
              s.id === 'SURV_02' ||
              s.id === 'SURV_03',
          }));
        }
      }
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
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { valid: false, error: 'Tệp sao lưu không đúng định dạng JSON object hợp lệ.' };
      }
      if (!Array.isArray(parsed.learners) || parsed.learners.length === 0) {
        return { valid: false, error: 'Tệp sao lưu thiếu danh sách người học (learners) hoặc danh sách rỗng.' };
      }

      // Kiểm tra toàn bộ 100% hồ sơ người học thay vì chỉ 5 hồ sơ đầu
      for (let i = 0; i < parsed.learners.length; i++) {
        const item = parsed.learners[i];
        if (!item || typeof item !== 'object') {
          return { valid: false, error: `Hồ sơ thứ ${i + 1} không phải là đối tượng hợp lệ.` };
        }
        if (!item.learner_id || typeof item.learner_id !== 'string' || item.learner_id.trim() === '') {
          return { valid: false, error: `Hồ sơ thứ ${i + 1} thiếu mã định danh learner_id hoặc không hợp lệ.` };
        }
        if (!item.class_name || typeof item.class_name !== 'string' || !['LOP_A', 'LOP_B', 'LOP_C'].includes(item.class_name)) {
          return { valid: false, error: `Hồ sơ thứ ${i + 1} (${item.learner_id}) có lớp "${item.class_name}" không hợp lệ.` };
        }
        const numericFields = [
          'assignments_due',
          'assignments_submitted',
          'late_submissions',
          'code_runs',
          'tests_passed',
          'total_tests',
        ];
        for (const field of numericFields) {
          const val = item[field];
          if (val === null || val === undefined || typeof val !== 'number' || Number.isNaN(val) || val < 0) {
            return { valid: false, error: `Hồ sơ thứ ${i + 1} (${item.learner_id}): chỉ số ${field} không phải số không âm hợp lệ.` };
          }
        }
        if (Array.isArray(item.weekly_history)) {
          for (let w = 0; w < item.weekly_history.length; w++) {
            const h = item.weekly_history[w];
            if (!h || typeof h !== 'object' || typeof h.week !== 'number' || typeof h.test_pass_rate !== 'number') {
              return { valid: false, error: `Hồ sơ thứ ${i + 1} (${item.learner_id}): tuần lịch sử thứ ${w + 1} không hợp lệ.` };
            }
          }
        }
      }

      // Kiểm tra cấu hình ngưỡng nếu có
      if (parsed.thresholds) {
        if (typeof parsed.thresholds !== 'object' || Array.isArray(parsed.thresholds)) {
          return { valid: false, error: 'Cấu hình ngưỡng (thresholds) trong tệp sao lưu không hợp lệ.' };
        }
        const reqFields = ['submissionRate', 'testPassRate', 'evidenceAlert', 'evidenceWatch'];
        for (const f of reqFields) {
          if (typeof parsed.thresholds[f] !== 'number' || Number.isNaN(parsed.thresholds[f])) {
            return { valid: false, error: `Cấu hình ngưỡng thiếu hoặc sai kiểu trường ${f}.` };
          }
        }
      }

      // Kiểm tra quyết định giáo viên nếu có
      if (parsed.reviews) {
        if (typeof parsed.reviews !== 'object' || Array.isArray(parsed.reviews)) {
          return { valid: false, error: 'Danh sách quyết định giáo viên (reviews) phải là đối tượng key-value.' };
        }
      }

      // Kiểm tra danh sách khảo sát nếu có
      if (parsed.surveys) {
        if (!Array.isArray(parsed.surveys)) {
          return { valid: false, error: 'Danh sách khảo sát giáo viên (surveys) phải là một mảng.' };
        }
        for (let s = 0; s < parsed.surveys.length; s++) {
          const surv = parsed.surveys[s];
          if (!surv || typeof surv !== 'object') {
            return { valid: false, error: `Phiếu khảo sát thứ ${s + 1} không phải là đối tượng hợp lệ.` };
          }
        }
      }

      // Kiểm tra nhật ký hệ thống nếu có
      if (parsed.logs) {
        if (!Array.isArray(parsed.logs)) {
          return { valid: false, error: 'Nhật ký hệ thống (logs) phải là một mảng.' };
        }
        for (let l = 0; l < parsed.logs.length; l++) {
          const log = parsed.logs[l];
          if (!log || typeof log !== 'object' || !log.id || !log.event_type) {
            return { valid: false, error: `Bản ghi nhật ký thứ ${l + 1} thiếu id hoặc event_type.` };
          }
        }
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

  importTeacherSurveys(jsonString: string): { success: boolean; addedCount: number; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const incomingList: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.surveys) ? parsed.surveys : [];
      if (incomingList.length === 0) {
        return { success: false, addedCount: 0, message: 'Tệp JSON không chứa danh sách khảo sát hợp lệ.' };
      }

      const currentSurveys = this.getTeacherSurveys();
      let added = 0;
      for (const item of incomingList) {
        if (!item || typeof item !== 'object' || !item.teacher_name) continue;
        const isDuplicate = currentSurveys.some(
          (c) =>
            c.teacher_name === item.teacher_name &&
            c.subject === item.subject &&
            c.q1_easy_to_use === item.q1_easy_to_use &&
            c.q7_would_use_in_practice === item.q7_would_use_in_practice &&
            (c.created_at === item.created_at || c.id === item.id)
        );
        if (!isDuplicate) {
          const newId = `SURV_${(currentSurveys.length + 1).toString().padStart(2, '0')}`;
          const newSurvey: TeacherSurveyResponse = {
            id: newId,
            teacher_name: String(item.teacher_name).trim(),
            subject: String(item.subject || 'CS101').trim(),
            created_at: item.created_at || new Date().toLocaleString('vi-VN', { hour12: false }),
            q1_easy_to_use: Number(item.q1_easy_to_use) || 4,
            q2_indicators_clear: Number(item.q2_indicators_clear) || 4,
            q3_reasons_clear: Number(item.q3_reasons_clear) || 4,
            q4_helps_identify: Number(item.q4_helps_identify) || 4,
            q5_realistic_interventions: Number(item.q5_realistic_interventions) || 4,
            q6_no_stigmatization: Number(item.q6_no_stigmatization) || 4,
            q7_would_use_in_practice: Number(item.q7_would_use_in_practice) || 4,
            most_useful_indicator: item.most_useful_indicator || '',
            unreasonable_alert: item.unreasonable_alert || '',
            needed_information: item.needed_information || '',
            suggestions: item.suggestions || '',
            is_sample: Boolean(item.is_sample),
          };
          currentSurveys.unshift(newSurvey);
          added++;
        }
      }

      if (added > 0) {
        localStorage.setItem(KEYS.SURVEYS, JSON.stringify(currentSurveys));
        return { success: true, addedCount: added, message: `Đã nạp và gộp thành công ${added} phản hồi khảo sát mới vào trình duyệt!` };
      } else {
        return { success: true, addedCount: 0, message: 'Tất cả phản hồi trong tệp đã tồn tại trong hệ thống, không có mục mới nào được thêm.' };
      }
    } catch (e: any) {
      return { success: false, addedCount: 0, message: `Lỗi đọc tệp JSON khảo sát: ${e.message}` };
    }
  },

  restoreBackup(jsonString: string, isRollback = false): { success: boolean; message: string } {
    const preview = this.previewBackup(jsonString);
    if (!preview.valid) {
      return { success: false, message: preview.error || 'Dữ liệu sao lưu không hợp lệ.' };
    }

    // Sao lưu trạng thái hiện tại trong bộ nhớ để hoàn tác nguyên tử nếu ghi lỗi
    const previousState: Record<string, string | null> = {};
    for (const key of Object.values(KEYS)) {
      previousState[key] = localStorage.getItem(key);
    }

    try {
      // Chỉ lưu snapshot rollback mới khi KHÔNG PHẢI đang thực hiện rollback
      if (!isRollback) {
        const rollback = this.createBackup();
        localStorage.setItem('codecare_rollback_snapshot', rollback);
      }

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
        reasons: isRollback ? 'Người dùng bấm nút Hoàn tác (Rollback)' : 'Người dùng nạp lại file sao lưu JSON',
        system_result: 'Khôi phục thành công',
        teacher_decision: isRollback ? 'Đã hoàn tác phiên trước' : 'Đã khôi phục dữ liệu',
        notes: `Nạp lại ${parsed.learners.length} học viên từ bản sao lưu ngày ${parsed.exported_at || 'N/A'}.`,
      });

      return { success: true, message: `Khôi phục thành công ${parsed.learners.length} học viên!` };
    } catch (e: any) {
      // Hoàn tác lại trạng thái cũ nếu quá trình ghi bị lỗi
      for (const [key, value] of Object.entries(previousState)) {
        if (value !== null) {
          localStorage.setItem(key, value);
        } else {
          localStorage.removeItem(key);
        }
      }
      return { success: false, message: `Lỗi khi khôi phục, đã hoàn tác về trạng thái trước: ${e.message}` };
    }
  },

  rollback(): { success: boolean; message: string } {
    try {
      const rollbackData = localStorage.getItem('codecare_rollback_snapshot');
      if (!rollbackData) {
        return { success: false, message: 'Không tìm thấy điểm khôi phục (snapshot) trước đó.' };
      }
      return this.restoreBackup(rollbackData, true);
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

