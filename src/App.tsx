import React, { useState, useMemo } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { LearnersView } from './components/views/LearnersView';
import { AlertsView } from './components/views/AlertsView';
import { InterventionsView } from './components/views/InterventionsView';
import { AuditView } from './components/views/AuditView';
import { DataManagementView } from './components/views/DataManagementView';
import { SettingsView } from './components/views/SettingsView';
import { TeacherSurveyView } from './components/views/TeacherSurveyView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { TestCasesView } from './components/views/TestCasesView';
import { ResponsibleAIView } from './components/views/ResponsibleAIView';
import { LearnerDetailModal } from './components/views/LearnerDetailModal';

import {
  ClassName,
  ThresholdConfig,
  TeacherConfirmation,
  InterventionType,
  InterventionStatus,
} from './types';
import { StorageService } from './services/storage';
import { calculateDerivedLearner } from './services/analytics';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedClass, setSelectedClass] = useState<'ALL' | ClassName>('ALL');
  const [selectedWeek, setSelectedWeek] = useState<number>(6);
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(null);

  // Persistent States
  const [thresholds, setThresholds] = useState<ThresholdConfig>(() =>
    StorageService.getThresholds()
  );
  const [reviews, setReviews] = useState<Record<string, any>>(() =>
    StorageService.getTeacherReviews()
  );
  const [rawLearners, setRawLearners] = useState(() =>
    StorageService.getLearnersRaw()
  );

  // Derive learners with live thresholds & reviews
  const allDerivedLearners = useMemo(() => {
    return rawLearners.map((raw) =>
      calculateDerivedLearner(raw, thresholds, reviews[raw.learner_id])
    );
  }, [rawLearners, thresholds, reviews]);

  // Filter by selected class in header
  const visibleLearners = useMemo(() => {
    if (selectedClass === 'ALL') return allDerivedLearners;
    return allDerivedLearners.filter((l) => l.class_name === selectedClass);
  }, [allDerivedLearners, selectedClass]);

  // Selected learner object for modal
  const selectedLearner = useMemo(() => {
    if (!selectedLearnerId) return null;
    return (
      allDerivedLearners.find((l) => l.learner_id === selectedLearnerId) || null
    );
  }, [allDerivedLearners, selectedLearnerId]);

  // Counts for Badges
  const unreviewedAlertsCount = useMemo(() => {
    return allDerivedLearners.filter(
      (l) => l.alert_status === 'ALERT' && l.teacher_confirmation === 'UNREVIEWED'
    ).length;
  }, [allDerivedLearners]);

  const activeInterventionsCount = useMemo(() => {
    return allDerivedLearners.filter(
      (l) =>
        l.teacher_confirmation === 'CONFIRMED' ||
        (l.intervention_status && l.intervention_status !== 'NONE')
    ).length;
  }, [allDerivedLearners]);

  // Handlers
  const handleReviewAlert = (
    learnerId: string,
    decision: TeacherConfirmation,
    notes?: string
  ) => {
    const updatedReview = {
      confirmation: decision,
      notes: notes || (reviews[learnerId]?.notes ?? ''),
      intervention_status: decision === 'CONFIRMED' ? 'PENDING' : 'NONE',
      intervention_type: 'Hỗ trợ trực tiếp',
    };
    StorageService.saveTeacherReview(learnerId, updatedReview);
    setReviews(StorageService.getTeacherReviews());

    // Audit Log
    const target = allDerivedLearners.find((l) => l.learner_id === learnerId);
    StorageService.addAuditLog({
      learner_id: learnerId,
      event_type:
        decision === 'CONFIRMED'
          ? 'GV xác nhận cần hỗ trợ'
          : decision === 'WATCHING'
          ? 'GV theo dõi thêm'
          : 'GV bác bỏ cảnh báo',
      reasons: target?.alert_reasons.slice(0, 2).join('; ') || 'Xem xét định kỳ',
      system_result: `${target?.alert_status} (Score ${target?.evidence_score})`,
      teacher_decision:
        decision === 'CONFIRMED'
          ? 'Xác nhận cần hỗ trợ'
          : decision === 'WATCHING'
          ? 'Theo dõi thêm'
          : 'Không cần can thiệp',
      notes: notes || 'Xử lý trực tiếp từ bảng điều khiển',
    });
  };

  const handleSaveDetailReview = (
    learnerId: string,
    decision: TeacherConfirmation,
    notes: string,
    intervention?: {
      type: InterventionType;
      status: InterventionStatus;
      date: string;
      outcome: string;
    }
  ) => {
    const updatedReview = {
      confirmation: decision,
      notes,
      intervention_type: intervention?.type,
      intervention_status: intervention?.status,
      intervention_date: intervention?.date,
      intervention_outcome: intervention?.outcome,
    };
    StorageService.saveTeacherReview(learnerId, updatedReview);
    setReviews(StorageService.getTeacherReviews());

    // Audit Log
    const target = allDerivedLearners.find((l) => l.learner_id === learnerId);
    StorageService.addAuditLog({
      learner_id: learnerId,
      event_type:
        decision === 'CONFIRMED'
          ? 'GV xác nhận cần hỗ trợ'
          : decision === 'WATCHING'
          ? 'GV theo dõi thêm'
          : 'GV bác bỏ cảnh báo',
      reasons: target?.alert_reasons.slice(0, 2).join('; ') || 'Cập nhật từ hồ sơ',
      system_result: `${target?.alert_status} (Score ${target?.evidence_score})`,
      teacher_decision:
        decision === 'CONFIRMED'
          ? `Xác nhận (${intervention?.type})`
          : decision === 'WATCHING'
          ? 'Theo dõi thêm'
          : 'Bác bỏ cảnh báo',
      notes: notes || intervention?.outcome || 'Cập nhật kế hoạch can thiệp từ hồ sơ',
    });
  };

  const handleUpdateIntervention = (
    learnerId: string,
    type: InterventionType,
    status: InterventionStatus,
    date: string,
    notes: string,
    outcome: string
  ) => {
    const current = reviews[learnerId] || {};
    const updated = {
      ...current,
      confirmation: 'CONFIRMED',
      intervention_type: type,
      intervention_status: status,
      intervention_date: date,
      notes,
      intervention_outcome: outcome,
    };
    StorageService.saveTeacherReview(learnerId, updated);
    setReviews(StorageService.getTeacherReviews());

    StorageService.addAuditLog({
      learner_id: learnerId,
      event_type: 'Cập nhật can thiệp',
      reasons: `Kế hoạch: ${type}`,
      system_result: 'Cần hỗ trợ',
      teacher_decision: `Trạng thái: ${status}`,
      notes: outcome || notes || 'Đã cập nhật tiến độ can thiệp',
    });
  };

  const handleUpdateThresholds = (newConfig: ThresholdConfig) => {
    StorageService.saveThresholds(newConfig);
    setThresholds(newConfig);

    StorageService.addAuditLog({
      learner_id: 'HỆ THỐNG',
      event_type: 'Thay đổi ngưỡng',
      reasons: `Ngưỡng cảnh báo: Score >= ${newConfig.evidenceAlert}, Sub: ${Math.round(newConfig.submissionRate * 100)}%`,
      system_result: 'Cập nhật tham số suy luận',
      teacher_decision: 'Đã lưu cấu hình mới',
      notes: 'Hệ thống đã tính toán lại toàn bộ chỉ số Audit và Dashboard',
    });
  };

  const handleResetDemo = () => {
    StorageService.resetDemoData();
    setThresholds(StorageService.getThresholds());
    setReviews(StorageService.getTeacherReviews());
    setRawLearners(StorageService.getLearnersRaw());
    setSelectedLearnerId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        unreviewedAlertsCount={unreviewedAlertsCount}
        onOpenAlerts={() => setCurrentTab('alerts')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          unreviewedAlertsCount={unreviewedAlertsCount}
          activeInterventionsCount={activeInterventionsCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'overview' && (
            <OverviewView
              learners={visibleLearners}
              thresholds={thresholds}
              selectedWeek={selectedWeek}
              onSelectLearner={setSelectedLearnerId}
              onNavigateToTab={setCurrentTab}
              onReviewAlert={handleReviewAlert}
            />
          )}

          {currentTab === 'learners' && (
            <LearnersView
              learners={visibleLearners}
              onSelectLearner={setSelectedLearnerId}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              learners={visibleLearners}
              onSelectLearner={setSelectedLearnerId}
              onReviewAlert={handleReviewAlert}
            />
          )}

          {currentTab === 'interventions' && (
            <InterventionsView
              learners={visibleLearners}
              onSelectLearner={setSelectedLearnerId}
              onUpdateIntervention={handleUpdateIntervention}
            />
          )}

          {currentTab === 'audit' && (
            <AuditView
              learners={allDerivedLearners}
              thresholds={thresholds}
              onSelectLearner={setSelectedLearnerId}
            />
          )}

          {currentTab === 'data' && (
            <DataManagementView
              onResetDemo={handleResetDemo}
              onDataReload={() => {
                setThresholds(StorageService.getThresholds());
                setReviews(StorageService.getTeacherReviews());
                setRawLearners(StorageService.getLearnersRaw());
              }}
              learners={visibleLearners}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              thresholds={thresholds}
              onUpdateThresholds={handleUpdateThresholds}
              learners={allDerivedLearners}
            />
          )}

          {currentTab === 'survey' && <TeacherSurveyView />}

          {currentTab === 'logs' && <AuditLogsView />}

          {currentTab === 'testcases' && <TestCasesView />}

          {currentTab === 'responsible_ai' && <ResponsibleAIView />}
        </main>
      </div>

      {/* Detail Modal for Selected Learner */}
      <LearnerDetailModal
        learner={selectedLearner}
        onClose={() => setSelectedLearnerId(null)}
        onSaveReview={handleSaveDetailReview}
      />
    </div>
  );
}
