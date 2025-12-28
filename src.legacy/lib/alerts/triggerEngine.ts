import { Alert } from '@/store/alertsStore'

export type FetchCurrentPrice = (symbol: string) => Promise<number | null>

export type TriggeredAlert = {
  alert: Alert
  price: number
}

export function evaluateCondition(alert: Alert, price: number): boolean {
  if (Number.isNaN(price)) {
    return false
  }

  if (alert.type === 'price-above') {
    return price >= alert.threshold
  }

  if (alert.type === 'price-below') {
    return price <= alert.threshold
  }

  return false
}

export const fetchCurrentPrice: FetchCurrentPrice = async (symbol) => {
  if (!symbol) {
    return null
  }

  try {
    const response = await fetch(`/api/prices?symbol=${encodeURIComponent(symbol)}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      console.warn('Failed to fetch price', symbol, response.status)
      return null
    }

    const data = await response.json()
    const price = Number(data?.price)

    if (Number.isNaN(price)) {
      console.warn('Received invalid price for symbol', symbol, data)
      return null
    }

    return price
  } catch (error) {
    console.error('Failed to fetch price for symbol', symbol, error)
    return null
  }
}

export async function checkAlerts(
  alerts: Alert[],
  fetchPrice: FetchCurrentPrice = fetchCurrentPrice,
): Promise<TriggeredAlert[]> {
  const armedAlerts = alerts.filter((alert) => alert.status === 'armed')
  if (!armedAlerts.length) {
    return []
  }

  const uniqueSymbols = Array.from(new Set(armedAlerts.map((alert) => alert.symbol)))
  const priceEntries = await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      try {
        const price = await fetchPrice(symbol)
        return [symbol, price] as const
      } catch (error) {
        console.error('Error while fetching price for symbol', symbol, error)
        return [symbol, null] as const
      }
    }),
  )

  const prices = new Map<string, number | null>(priceEntries)

  return armedAlerts.reduce<TriggeredAlert[]>((acc, alert) => {
    const price = prices.get(alert.symbol)
    if (typeof price === 'number' && evaluateCondition(alert, price)) {
      acc.push({ alert, price })
    }
    return acc
  }, [])
}

export function canUseNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!canUseNotifications()) {
    return 'denied'
  }

  if (Notification.permission === 'default') {
    try {
      return await Notification.requestPermission()
    } catch (error) {
      console.error('Notification permission request failed', error)
      return 'denied'
    }
  }

  return Notification.permission
}

export function notifyAlertTriggered(alert: Alert, price: number): void {
  if (!canUseNotifications()) {
    return
  }

  if (Notification.permission !== 'granted') {
    return
  }

  const comparison = alert.type === 'price-above' ? '>=' : '<='

  new Notification(`Alert triggered: ${alert.symbol}`, {
    body: `Price is now ${price} (${comparison} ${alert.threshold})`,
    tag: `alert-${alert.id}`,
  })
}
