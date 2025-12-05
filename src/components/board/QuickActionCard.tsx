/**
 * Quick Action Card Component
 * 
 * Navigation shortcut card:
 * - Mobile: 96x96px (icon-center, label-bottom)
 * - Desktop: Full-width (icon-left, label-left)
 */

import type { LucideIcon } from '@/lib/icons';

interface QuickActionCardProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  mobile?: boolean;
}

export default function QuickActionCard({
  label,
  icon: Icon,
  onClick,
  mobile = false,
}: QuickActionCardProps) {
  if (mobile) {
    // Mobile: 96x96px Card (icon-center, label-bottom)
    return (
      <button
        onClick={onClick}
        className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center gap-2 bg-smoke transition-all active:scale-95 snap-center"
        style={{
          borderRadius: 'var(--radius-lg)',
          transition: 'all var(--duration-short) var(--ease-in-out)',
        }}
        aria-label={label}
      >
        <Icon size={24} className="text-fog" />
        <span className="text-xs font-medium text-fog text-center px-1">{label}</span>
      </button>
    );
  }
  
  // Desktop: Full-width Card (icon-left, label-left)
  return (
    <button
      onClick={onClick}
      className="flex h-20 w-full items-center gap-4 border border-smoke-light bg-smoke px-4 py-4 transition-all hover:bg-smoke-light hover:scale-[1.02] active:scale-95"
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-none)',
        transition: 'all var(--duration-short) var(--ease-in-out)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-none)';
      }}
      aria-label={label}
    >
      <Icon size={24} className="text-fog" />
      <span className="text-sm font-medium text-fog">{label}</span>
    </button>
  );
}
