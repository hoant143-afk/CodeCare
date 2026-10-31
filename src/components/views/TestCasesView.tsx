import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  XCircle,
  Play,
  Download,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  MonitorCheck,
  Clock,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { TestCaseItem, ThresholdConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { runAutomatedTestSuites, TestRunReport } from '../../services/testRunner';
import { exportTestResultsToJSON } from '../../services/exportService';

export const TestCasesView: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCaseItem[]>(() => StorageService.getTestCases());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastReport, setLastReport] = useState<TestRunReport | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'AUTOMATED' | 'MANUAL_UI'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');

  const handleRunAllTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const learners = StorageService.getLearnersRaw();
      const thresholds = StorageService.getThresholds();
      const report = runAutomatedTestSuites(learners, thresholds);
      setTestCases(report.results);
      setLastReport(report);
      StorageService.saveTestCases(report.results);
      setIsRunning(false);
    }, 150);
  };

  const handleExportJSON = () => {
    exportTestResultsToJSON(testCases);
  };

  const filteredCases = testCases.filter((tc) => {
    if (selectedFilter !== 'ALL' && tc.test_type !== selectedFilter) return false;
    if (statusFilter !== 'ALL' && tc.status !== statusFilter) return false;
    return true;
  });

  const passedCount = testCases.filter((tc) => tc.status === 'PASS').length;
  const failedCount = testCases.filter((tc) => tc.status === 'FAIL').length;
  const automatedCount = testCases.filter((tc) => tc.test_type === 'AUTOMATED').length;
  const manualCount = testCases.filter((tc) => tc.test_type === 'MANUAL_UI').length;
  const passRate = testCases.length > 0 ? ((passedCount / testCases.length) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-sky-800" />
            <span>Kịch bản Kiểm thử Sư phạm & Kỹ thuật ({testCases.length} Kịch bản)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống kiểm thử xác thực sống (Live assertions) thẩm định thuật toán Evidence Score, ngưỡng phân loại, khả năng chống lỗi mẫu số bằng 0, dữ liệu biên và quyền ghi đè sư phạm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunAllTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-800 text-white hover:bg-sky-900 disabled:opacity-50 transition shadow-xs cursor-pointer"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Play className="w-4 h-4 fill-white text-white" />
            )}
            <span>{isRunning ? 'Đang thực thi...' : 'Chạy toàn bộ kiểm thử'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất JSON</span>
          </button>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase">Tỷ lệ đạt (Pass Rate)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{passRate}%</span>
            <span className="text-xs text-slate-500">({passedCount}/{testCases.length})</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase">Kiểm thử tự động</span>
            <Cpu className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-900">{automatedCount}</span>
            <span className="text-xs text-slate-500">Live assertions</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase">Kiểm thử giao diện</span>
            <MonitorCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-900">{manualCount}</span>
            <span className="text-xs text-slate-500">Human-in-the-loop</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase">Thời gian thực thi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {lastReport ? `${lastReport.executionTimeTotalMs} ms` : 'Live ready'}
            </span>
            {lastReport && (
              <span className="text-[10px] text-slate-400 block truncate">({lastReport.executedAt})</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Tab controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Loại:
          </span>
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-sky-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({testCases.length})
          </button>
          <button
            onClick={() => setSelectedFilter('AUTOMATED')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'AUTOMATED'
                ? 'bg-sky-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3 h-3" />
            Tự động ({automatedCount})
          </button>
          <button
            onClick={() => setSelectedFilter('MANUAL_UI')}
            className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
              selectedFilter === 'MANUAL_UI'
                ? 'bg-sky-800 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MonitorCheck className="w-3 h-3" />
            Giao diện ({manualCount})
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium mr-1">Kết quả:</span>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter('PASS')}
            className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
              statusFilter === 'PASS' ? 'bg-emerald-700 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            PASS ({passedCount})
          </button>
          {failedCount > 0 && (
            <button
              onClick={() => setStatusFilter('FAIL')}
              className={`px-2 py-0.5 rounded text-[11px] transition cursor-pointer ${
                statusFilter === 'FAIL' ? 'bg-rose-700 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              FAIL ({failedCount})
            </button>
          )}
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="divide-y divide-slate-100 text-xs">
          {filteredCases.map((tc) => {
            const isExpanded = expandedId === tc.id;
            const isAutomated = tc.test_type === 'AUTOMATED';
            const isPass = tc.status === 'PASS';

            return (
              <div key={tc.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : tc.id)}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {tc.id}
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {tc.title}
                      </span>
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {tc.category}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 ${
                          isAutomated
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {isAutomated ? <Cpu className="w-2.5 h-2.5" /> : <MonitorCheck className="w-2.5 h-2.5" />}
                        {isAutomated ? 'Tự động (Live Assertions)' : 'Thủ công (UI/UX)'}
                      </span>
                      {tc.execution_time_ms !== undefined && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tc.execution_time_ms} ms
                        </span>
                      )}
                    </div>

                    <div className="text-slate-600 text-xs">
                      <span className="font-medium text-slate-700">Dữ liệu kiểm tra: </span>
                      <span className="font-mono text-slate-600 text-[11px]">{tc.input_data}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 border ${
                        isPass
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isPass ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                      )}
                      <span>{tc.status}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-3.5 rounded-lg text-xs animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="font-semibold text-slate-800 block mb-0.5">Hành động kiểm thử:</span>
                        <p className="text-slate-600">{tc.action}</p>

                        <span className="font-semibold text-slate-800 block mt-2 mb-0.5">Kết quả kỳ vọng (Expected):</span>
                        <p className="text-emerald-700 font-medium bg-emerald-50/70 p-2 rounded border border-emerald-200">
                          {tc.expected_result}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-800 block mb-0.5">Kết quả thực tế đo được (Actual):</span>
                        <p className="text-sky-800 font-medium bg-sky-50/70 p-2 rounded border border-sky-200 font-mono text-[11px]">
                          {tc.actual_result}
                        </p>

                        <span className="font-semibold text-slate-800 block mt-2 mb-0.5">Ý nghĩa sư phạm & Giải thích kỹ thuật:</span>
                        <p className="text-slate-600">{tc.details}</p>
                      </div>
                    </div>

                    {tc.error_message && (
                      <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Chi tiết lỗi: </span>
                          <span>{tc.error_message}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
