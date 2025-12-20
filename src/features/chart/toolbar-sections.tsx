import React from "react"
import { getAlertsList, type AlertListItem } from "@/api/alerts"
import { buildAlertPrefillSearchParams } from "@/features/alerts/prefill"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/ui/cn"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

export type ChartToolbarSectionId = "indicators" | "drawings" | "alerts"

export interface ChartToolbarSection {
  id: ChartToolbarSectionId
  label: string
  description: string
  icon: React.ReactNode
  render: (context: { isExpanded: boolean }) => React.ReactNode
}

const IndicatorIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="sf-chart-toolbar__icon">
    <path
      d="M4 17h6M4 12h10M4 7h16M16 17h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const DrawingIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="sf-chart-toolbar__icon">
    <path
      d="M4 19l6-6 4 4 6-8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M4 5h6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const AlertIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="sf-chart-toolbar__icon">
    <path
      d="M12 3c3.314 0 6 2.686 6 6 0 2.7-.9 3.9-1.8 5.2l-.7 1c-.3.4-.5.9-.5 1.4v1.4H9v-1.4c0-.5-.2-1-.5-1.4l-.7-1C6.9 12.9 6 11.7 6 9c0-3.314 2.686-6 6-6Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M9.5 21h5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

const IndicatorsPanel = () => (
  <div className="sf-chart-panel-stack">
    <p className="sf-chart-panel-subtext">Moving averages, RSI, volume (WP-052).</p>
    <ul className="sf-chart-panel-list" aria-label="Indicator presets">
      <li>Default trend stack</li>
      <li>Momentum snapshot</li>
      <li>Volume profile</li>
    </ul>
  </div>
)

const DrawingsPanel = () => (
  <div className="sf-chart-panel-stack">
    <p className="sf-chart-panel-subtext">Lines, boxes, fibs (WP-052).</p>
    <ul className="sf-chart-panel-list" aria-label="Drawing tools">
      <li>Trend line</li>
      <li>Channel</li>
      <li>Fib retracement</li>
    </ul>
  </div>
)

type AlertsPanelState = "idle" | "loading" | "success" | "error"

const formatAlertStatus = (status: AlertListItem["status"]) => {
  switch (status) {
    case "armed":
      return "Armed"
    case "triggered":
      return "Triggered"
    case "paused":
      return "Paused"
    default:
      return "Armed"
  }
}

const AlertsPanel = ({ isExpanded }: { isExpanded: boolean }) => {
  const [alerts, setAlerts] = React.useState<AlertListItem[]>([])
  const [state, setState] = React.useState<AlertsPanelState>("idle")
  const hasLoaded = React.useRef(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const symbol = searchParams.get("symbol")?.trim() || undefined
  const timeframe = searchParams.get("timeframe")?.trim() || undefined

  const handleCreateAlert = React.useCallback(() => {
    const params = buildAlertPrefillSearchParams({
      symbol,
      timeframe,
      type: "price-above",
      condition: "Alert when price closes above the threshold.",
    })
    navigate({ pathname: "/alerts", search: `?${params.toString()}` })
  }, [navigate, symbol, timeframe])

  React.useEffect(() => {
    if (!isExpanded || hasLoaded.current) return
    let isActive = true
    hasLoaded.current = true
    setState("loading")

    getAlertsList()
      .then((nextAlerts) => {
        if (!isActive) return
        setAlerts(nextAlerts)
        setState("success")
      })
      .catch((error) => {
        if (!isActive) return
        console.warn("ChartToolbar alerts fetch failed", error)
        setState("error")
      })

    return () => {
      isActive = false
    }
  }, [isExpanded])

  const hasAlerts = alerts.length > 0

  return (
    <div className="sf-chart-panel-stack">
      <div className="sf-chart-toolbar__alerts-header">
        <p className="sf-chart-panel-subtext">Create + manage triggers (WP-052).</p>
        <div className="sf-chart-toolbar__alerts-actions">
          <Button size="sm" variant="primary" onClick={handleCreateAlert}>
            Create alert
          </Button>
          <Link to="/alerts" className="btn btn-ghost btn-sm" aria-label="Open alerts manager">
            Open alerts
          </Link>
        </div>
      </div>

      {state === "loading" ? (
        <p className="sf-chart-panel-subtext">Loading alerts…</p>
      ) : null}

      {state === "error" ? (
        <p className="sf-chart-panel-subtext">Unable to load alerts. Showing latest cached data.</p>
      ) : null}

      {hasAlerts ? (
        <ul className="sf-chart-toolbar__alerts-list" aria-label="Recent alerts">
          {alerts.slice(0, 4).map((alert) => (
            <li key={alert.id} className="sf-chart-toolbar__alert-row">
              <div className="sf-chart-toolbar__alert-main">
                <span className="sf-chart-toolbar__alert-symbol">{alert.symbol}</span>
                <span className="sf-chart-toolbar__alert-condition">{alert.condition}</span>
              </div>
              <span
                className={cn("sf-chart-toolbar__alert-status", `sf-chart-toolbar__alert-status--${alert.status}`)}
              >
                {formatAlertStatus(alert.status)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="sf-chart-toolbar__alerts-empty">
          <p className="sf-chart-panel-subtext">No alerts yet. Start with a quick price trigger.</p>
        </div>
      )}
    </div>
  )
}

export const chartToolbarSections: ChartToolbarSection[] = [
  {
    id: "indicators",
    label: "Indicators",
    description: "Indicator stacks and presets",
    icon: <IndicatorIcon />,
    render: () => <IndicatorsPanel />,
  },
  {
    id: "drawings",
    label: "Drawings",
    description: "Chart annotations and tools",
    icon: <DrawingIcon />,
    render: () => <DrawingsPanel />,
  },
  {
    id: "alerts",
    label: "Alerts",
    description: "Manage triggers & alerts",
    icon: <AlertIcon />,
    render: ({ isExpanded }) => <AlertsPanel isExpanded={isExpanded} />,
  },
]
