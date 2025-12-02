import React from 'react';

interface JournalLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
}

export default function JournalLayout({ list, detail }: JournalLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.4fr)]">
      <section className="rounded-2xl border border-border-subtle bg-surface p-4" data-testid="journal-list-panel">
        {list}
      </section>
      <section
        className="rounded-2xl border border-border-subtle bg-surface-subtle p-4"
        data-testid="journal-detail-panel-shell"
      >
        {detail}
      </section>
    </div>
  );
}
