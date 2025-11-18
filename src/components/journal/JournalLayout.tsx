import React from 'react';

interface JournalLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
}

export default function JournalLayout({ list, detail }: JournalLayoutProps) {
  return (
    <div className="space-y-6 lg:grid lg:grid-cols-[minmax(260px,1fr)_minmax(0,2fr)] lg:gap-6 lg:space-y-0">
      <section className="rounded-2xl border border-white/5 bg-black/30 p-4">{list}</section>
      <section className="rounded-2xl border border-white/5 bg-black/20 p-4">{detail}</section>
    </div>
  );
}
