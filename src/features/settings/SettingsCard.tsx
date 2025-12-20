import type { ReactNode } from 'react'
import { cn } from '@/lib/ui/cn'
import './settings.css'

interface SettingsCardProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export default function SettingsCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: SettingsCardProps) {
  return (
    <section className={cn('settings-card', className)}>
      {(title || subtitle || actions) && (
        <header className="settings-card__header">
          <div className="settings-card__titles">
            {title ? <h3 className="settings-card__title">{title}</h3> : null}
            {subtitle ? <p className="settings-card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="settings-card__actions">{actions}</div> : null}
        </header>
      )}
      <div className="settings-card__body">{children}</div>
    </section>
  )
}
