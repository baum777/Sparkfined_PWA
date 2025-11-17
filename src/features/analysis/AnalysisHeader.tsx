import React from 'react';

interface AnalysisHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AnalysisHeader({ title, subtitle }: AnalysisHeaderProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Sparkfined</p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="text-sm text-zinc-400">{subtitle}</p> : null}
      </div>
    </div>
  );
}
