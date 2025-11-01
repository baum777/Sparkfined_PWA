import { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-4 pb-24" role="main">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
