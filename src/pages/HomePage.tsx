import { useState } from 'react'
import Logo from '@/components/Logo'

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full text-center space-y-6">
        <Logo />

        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Sparkfined TA-PWA Beta Shell
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400">
          Technical Analysis Progressive Web App
        </p>

        <div className="flex flex-col items-center gap-4 pt-4">
          <button onClick={toggleDarkMode} className="btn-primary">
            Toggle {darkMode ? 'Light' : 'Dark'} Mode
          </button>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>✅ React 18 + Vite 6 + TypeScript</p>
            <p>✅ Tailwind CSS + Dark Mode</p>
            <p>✅ PWA Ready</p>
            <p>✅ ESLint + Prettier</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Foundation ready → Proceed to <strong>Phase 1</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
