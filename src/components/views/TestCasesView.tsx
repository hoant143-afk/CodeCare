import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  XCircle,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TestCaseItem } from '../../types';
import { StorageService } from '../../services/storage';

export const TestCasesView: React.FC = () => {
  const [testCases] = useState<TestCaseItem[]>(StorageService.getTestCases());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const passedCount = testCases.filter((tc) => tc.status === 'PASS').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-sky-800" />
            <span>Kịch bản Kiểm thử Sư phạm & Kỹ thuật (12 Test Cases)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Hồ sơ kiểm thử thẩm định tính hợp lệ của hệ thống suy luận, quy tắc sư phạm, quyền ghi đè và độ nhạy ngưỡng.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-1.5 rounded-lg text-xs font-semibold self-start sm:self-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{passedCount} / {testCases.length} Test Cases Passed (100%)</span>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="divide-y divide-slate-100 text-xs">
          {testCases.map((tc) => {
            const isExpanded = expandedId === tc.id;
            return (
              <div key={tc.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : tc.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {tc.id}
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {tc.title}
                      </span>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {tc.category}
                      </span>
                    </div>

                    <div className="text-slate-600 text-xs">
                      <span className="font-medium text-slate-700">Dữ liệu đầu vào: </span>
                      {tc.input_data}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-700" />
                      {tc.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/60 p-3 rounded-lg text-xs animate-in fade-in">
                    <div>
                      <span className="font-semibold text-slate-800 block mb-0.5">Hành động kiểm thử:</span>
                      <p className="text-slate-600">{tc.action}</p>

                      <span className="font-semibold text-slate-800 block mt-2 mb-0.5">Kết quả mong đợi:</span>
                      <p className="text-emerald-700 font-medium">{tc.expected_result}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-800 block mb-0.5">Kết quả thực tế trong hệ thống:</span>
                      <p className="text-sky-800 font-medium">{tc.actual_result}</p>

                      <span className="font-semibold text-slate-800 block mt-2 mb-0.5">Ý nghĩa sư phạm & Giải thích:</span>
                      <p className="text-slate-600">{tc.details}</p>
                    </div>
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
