import React from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Rail from './Rail'
import ActionPanel from './ActionPanel'

export default function AppShell() {
  return (
    <div className="sf-shell">
      <header className="sf-topbar">
        <Topbar />
      </header>

      <aside className="sf-rail">
        <Rail />
      </aside>

      {/* Skip-link target (App.tsx links to #main-content) */}
      <main id="main-content" className="sf-canvas">
        <Outlet />
      </main>

      {/* Komfortabel (420px) auf xl+ always-on */}
      <aside className="sf-action hidden xl:flex">
        <ActionPanel />
      </aside>
    </div>
  )
}
