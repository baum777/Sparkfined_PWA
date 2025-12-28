import React from "react"
import ChartLayout from "@/features/chart/ChartLayout"
import ReplayPage from "@/pages/ReplayPage"

type ChartPageMode = "chart" | "replay"

export default function ChartPage({ mode = "chart" }: { mode?: ChartPageMode }) {
  if (mode === "replay") {
    // Keep existing replay UI/testids, but mount under ChartPage for route truth.
    return <ReplayPage />
  }

  return <ChartLayout />
}
