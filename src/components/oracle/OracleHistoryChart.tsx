/**
 * Oracle History Chart
 * 
 * Displays a 30-day line chart of Oracle scores.
 * Uses simple SVG for lightweight rendering.
 */

import React, { useMemo } from 'react';
import type { OracleReport } from '@/types/oracle';

interface OracleHistoryChartProps {
  reports: OracleReport[];
}

export default function OracleHistoryChart({ reports }: OracleHistoryChartProps) {
  // Sort reports by date (oldest first for chart)
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [reports]);

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale data points
  const points = useMemo(() => {
    if (sortedReports.length === 0) return [];

    const maxScore = 7;
    const xStep = chartWidth / Math.max(sortedReports.length - 1, 1);

    return sortedReports.map((report, index) => ({
      x: padding.left + (index * xStep),
      y: padding.top + (chartHeight - (report.score / maxScore) * chartHeight),
      report,
    }));
  }, [sortedReports, chartWidth, chartHeight, padding]);

  // Generate SVG path
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    
    const firstPoint = points[0];
    if (!firstPoint) return '';
    
    let path = `M ${firstPoint.x} ${firstPoint.y}`;
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      if (point) {
        path += ` L ${point.x} ${point.y}`;
      }
    }
    return path;
  }, [points]);

  // Hover state
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Empty state
  if (sortedReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-12">
        <p className="text-sm text-text-secondary">
          No Oracle history available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-6">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">
        Oracle Score History (30 Days)
      </h2>
      
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label="Oracle score history chart"
        >
          {/* Y-axis grid lines */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((score) => {
            const y = padding.top + (chartHeight - (score / 7) * chartHeight);
            return (
              <g key={score}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border-subtle"
                  opacity="0.3"
                />
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-text-tertiary"
                  fontSize="12"
                >
                  {score}
                </text>
              </g>
            );
          })}

          {/* X-axis labels (show first, middle, last) */}
          {points.length > 0 && points[0] && points[points.length - 1] && (
            <>
              {/* First date */}
              <text
                x={points[0].x}
                y={height - padding.bottom + 20}
                textAnchor="start"
                className="text-text-tertiary"
                fontSize="12"
              >
                {formatDate(points[0].report.date)}
              </text>
              
              {/* Last date */}
              <text
                x={points[points.length - 1].x}
                y={height - padding.bottom + 20}
                textAnchor="end"
                className="text-text-tertiary"
                fontSize="12"
              >
                {formatDate(points[points.length - 1].report.date)}
              </text>
            </>
          )}

          {/* Line path */}
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={point.report.date}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? 6 : 4}
                fill="currentColor"
                className={hoveredPoint === index ? 'text-brand' : 'text-brand'}
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              />
              
              {/* Tooltip on hover */}
              {hoveredPoint === index && (
                <g>
                  <rect
                    x={point.x - 60}
                    y={point.y - 60}
                    width="120"
                    height="50"
                    rx="8"
                    fill="currentColor"
                    className="text-surface-elevated"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <text
                    x={point.x}
                    y={point.y - 40}
                    textAnchor="middle"
                    className="text-text-primary"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {formatDate(point.report.date)}
                  </text>
                  <text
                    x={point.x}
                    y={point.y - 25}
                    textAnchor="middle"
                    className="text-brand"
                    fontSize="14"
                    fontWeight="700"
                  >
                    Score: {point.report.score}/7
                  </text>
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    className="text-text-secondary"
                    fontSize="11"
                  >
                    {point.report.topTheme}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-brand" />
          <span className="text-xs text-text-secondary">Oracle Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">
            Hover over points to see details
          </span>
        </div>
      </div>
    </div>
  );
}
