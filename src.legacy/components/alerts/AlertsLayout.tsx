import React from 'react';

interface AlertsLayoutProps {
  children: React.ReactNode;
}

export default function AlertsLayout({ children }: AlertsLayoutProps) {
  return (
    <section className="card space-y-6 rounded-3xl p-4 sm:p-6">
      <div className="card-elevated rounded-2xl p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}

