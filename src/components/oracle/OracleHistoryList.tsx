/**
 * Oracle History List
 * 
 * Displays a list of past Oracle reports with key metadata.
 * Allows viewing full report in a modal.
 */

import React, { useState } from 'react';
import type { OracleReport } from '@/types/oracle';
import { CheckCircle2, Eye, X } from '@/lib/icons';

interface OracleHistoryListProps {
  reports: OracleReport[];
}

export default function OracleHistoryList({ reports }: OracleHistoryListProps) {
  const [selectedReport, setSelectedReport] = useState<OracleReport | null>(null);

  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Empty state
  if (sortedReports.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-12">
        <p className="text-center text-sm text-text-secondary">
          No Oracle reports found.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Past Reports
        </h2>
        
        <div className="space-y-2">
          {sortedReports.map((report) => (
            <div
              key={report.id || report.date}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface-subtle p-4 transition hover:bg-surface-hover"
              data-testid={`oracle-history-item-${report.date}`}
            >
              <div className="flex items-center gap-4">
                {/* Date */}
                <div className="min-w-[120px]">
                  <p className="text-sm font-medium text-text-primary">
                    {formatDate(report.date)}
                  </p>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-text-tertiary">
                    Score
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-sm font-semibold ${
                      report.score >= 6
                        ? 'bg-brand/20 text-brand'
                        : report.score >= 4
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-text-tertiary/20 text-text-tertiary'
                    }`}
                  >
                    {report.score}/7
                  </span>
                </div>

                {/* Theme */}
                <div className="hidden sm:block">
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
                    {report.topTheme}
                  </span>
                </div>

                {/* Read status */}
                {report.read && (
                  <div className="flex items-center gap-1.5 text-brand">
                    <CheckCircle2 size={16} />
                    <span className="text-xs">Read</span>
                  </div>
                )}
              </div>

              {/* View button */}
              <button
                type="button"
                onClick={() => setSelectedReport(report)}
                className="flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label={`View full report for ${formatDate(report.date)}`}
              >
                <Eye size={16} />
                <span className="hidden sm:inline">View</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full report */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedReport(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-3xl border border-border bg-surface-elevated shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface-elevated/95 p-6 backdrop-blur-sm">
              <div>
                <h3
                  id="report-modal-title"
                  className="text-xl font-semibold text-text-primary"
                >
                  Oracle Report
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {formatDate(selectedReport.date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-full p-2 text-text-secondary transition hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Metadata */}
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-tertiary">
                    Score
                  </p>
                  <p className="mt-1 text-2xl font-bold text-brand">
                    {selectedReport.score}/7
                  </p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-tertiary">
                    Top Theme
                  </p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    {selectedReport.topTheme}
                  </p>
                </div>
                {selectedReport.read && (
                  <>
                    <div className="h-12 w-px bg-border" />
                    <div className="flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand">
                      <CheckCircle2 size={16} />
                      <span>Read</span>
                    </div>
                  </>
                )}
              </div>

              {/* Full Report */}
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-tertiary">
                  Full Report
                </h4>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-border-subtle bg-surface-subtle p-4 text-sm leading-relaxed text-text-secondary">
                  {selectedReport.fullReport}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
