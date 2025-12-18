import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui';

interface InsightTeaserProps {
  title: string;
  bias: 'long' | 'short' | 'neutral';
  confidenceLabel: string;
  summary: string;
  className?: string;
}

function buildBulletSummary(summary: string): string[] {
  const normalized = summary.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const sentenceMatches = normalized.match(/[^.!?]+[.!?]+/g);
  const sentences = sentenceMatches ? sentenceMatches.map((chunk) => chunk.trim()) : [normalized];
  return sentences.filter(Boolean).slice(0, 3);
}

export default function InsightTeaser({ title, bias, confidenceLabel, summary, className }: InsightTeaserProps) {
  const navigate = useNavigate();

  const bullets = React.useMemo(() => buildBulletSummary(summary), [summary]);

  const handleViewFullAnalysis = React.useCallback(() => navigate('/analysis'), [navigate]);
  const handleOpenChart = React.useCallback(() => navigate('/chart'), [navigate]);

  const cardClassName = className ?? 'rounded-3xl p-6';

  return (
    <Card variant="elevated" className={cardClassName} data-testid="dashboard-bias-hero">
      <CardHeader className="mb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="dashboard-section-title">{title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={bias === 'long' ? 'long' : bias === 'short' ? 'short' : 'info'}>
                {bias === 'long' ? 'Long' : bias === 'short' ? 'Short' : 'Neutral'}
              </Badge>
              <Badge variant="info">{confidenceLabel}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-sm">
        {bullets.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-text-secondary">
            {bullets.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">{summary}</p>
        )}
      </CardContent>

      <CardFooter className="mt-6 justify-end">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={handleViewFullAnalysis}>
            View full analysis
          </Button>
          <Button size="sm" onClick={handleOpenChart}>
            Open chart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
