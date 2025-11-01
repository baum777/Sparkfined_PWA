import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-slate-400 mb-6 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
