import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import type { ComputedIndicator } from '@/domain/chart'
import { getChartColors } from '@/lib/chartColors'

type SeriesGroup = { type: 'line' | 'bb'; series: ISeriesApi<'Line'>[] }

export class IndicatorSeriesManager {
  private seriesMap = new Map<string, SeriesGroup>()

  constructor(private chart: IChartApi) {}

  apply(indicators: ComputedIndicator[] = []) {
    const nextIds = new Set(indicators.map((indicator) => indicator.id))

    this.seriesMap.forEach((_group, id) => {
      if (!nextIds.has(id)) {
        this.removeSeries(id)
      }
    })

    indicators.forEach((indicator) => {
      const group = this.seriesMap.get(indicator.id) ?? this.createSeries(indicator)
      this.seriesMap.set(indicator.id, group)
      this.setData(group, indicator)
    })
  }

  removeAll() {
    Array.from(this.seriesMap.keys()).forEach((id) => this.removeSeries(id))
  }

  private removeSeries(id: string) {
    const group = this.seriesMap.get(id)
    if (!group) return

    group.series.forEach((series) => {
      this.chart.removeSeries?.(series)
    })

    this.seriesMap.delete(id)
  }

  private createSeries(indicator: ComputedIndicator): SeriesGroup {
    const colors = getChartColors()

    if (indicator.type === 'bb') {
      const basis = this.chart.addLineSeries({ color: indicator.color ?? colors.warn, lineWidth: 2 })
      const upper = this.chart.addLineSeries({ color: colors.warn, lineWidth: 1 })
      const lower = this.chart.addLineSeries({ color: colors.warn, lineWidth: 1 })

      return { type: 'bb', series: [basis, upper, lower] }
    }

    const line = this.chart.addLineSeries({ color: indicator.color ?? colors.info, lineWidth: 2 })
    return { type: 'line', series: [line] }
  }

  private setData(group: SeriesGroup, indicator: ComputedIndicator) {
    if (group.type === 'bb' && indicator.type === 'bb') {
      const [basis, upper, lower] = group.series
      if (!basis || !upper || !lower) return

      basis.setData(indicator.basis)
      upper.setData(indicator.upper)
      lower.setData(indicator.lower)
      return
    }

    if (group.type === 'line' && indicator.type === 'line') {
      const [line] = group.series
      if (!line) return

      line.setData(indicator.points)
    }
  }
}
