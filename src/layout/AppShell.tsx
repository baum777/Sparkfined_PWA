import React from "react"
import { Outlet } from "react-router-dom"
import { cn } from "@/lib/ui/cn"
import Topbar from "./Topbar"
import Rail from "./Rail"
import ActionPanel from "./ActionPanel"

export default function AppShell() {
  return (
    <div className="sf-shell">
      <header className="sf-topbar">
        <Topbar />
      </header>

      <aside className="sf-rail">
        <Rail />
      </aside>

      <main className={cn("sf-canvas")}>
        <Outlet />
      </main>

      {/* Komfortabel: 420px auf xl+ immer sichtbar, darunter als next step: Drawer */}
      <aside className="sf-action hidden xl:flex">
        <ActionPanel />
      </aside>
    </div>
  )
}
