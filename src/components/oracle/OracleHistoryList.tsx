import React, { useState } from 'react';
import type { OracleReport } from '@/types/oracle';
import { X } from '@/lib/icons';

interface OracleHistoryListProps {
  reports: OracleReport[];
}

export function OracleHistoryList({ reports }: OracleHistoryListProps) {
  const [selectedReport, setSelectedReport] = useState<OracleReport | null>(null);

  return (
    <div
      className="rounded-3xl border border-border bg-surface/80 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.45)]"
      data-testid="oracle-history-list"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">History</h3>
          <p className="text-xs text-text-secondary">
            Past Oracle reports with read status & dominant theme.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60">
        <table className="min-w-full divide-y divide-border/70">
          <thead className="bg-surface-subtle text-left text-xs uppercase tracking-wide text-text-tertiary">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Theme</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70 text-sm text-text-secondary">
            {reports.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-text-tertiary" colSpan={5}>
                  No historical Oracle reports yet.
                </td>
              </tr>
            )}
            {reports.map((report) => (
              <tr key={report.id ?? report.date}>
                <td className="px-4 py-3 text-text-primary">{report.date}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-text-primary">{report.score}/7</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
                    {report.topTheme}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {report.read ? (
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                      Read
                    </span>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                      Unread
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="text-sm font-medium text-brand transition hover:text-brand/80"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <HistoryModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}

function HistoryModal({
  report,
  onClose,
}: {
  report: OracleReport;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-4 w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-token-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">{report.date}</p>
            <p className="text-xs text-text-secondary">
              Score {report.score}/7 • Theme: {report.topTheme}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/60 p-2 text-text-secondary transition hover:border-brand hover:text-brand"
            aria-label="Close report"
          >
            <X size={16} />
          </button>
        </div>

        <div className="rounded-2xl border border-border/70 bg-surface-subtle p-4">
          <pre className="max-h-[400px] overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-text-secondary">
            {report.fullReport}
          </pre>
        </div>
      </div>
    </div>
  );
}
