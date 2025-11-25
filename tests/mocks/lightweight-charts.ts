export const CrosshairMode = { Normal: 'Normal' }

export const createChart = () => {
  const setData = () => undefined
  const setMarkers = () => undefined
  const priceScale = () => ({
    applyOptions: () => undefined,
  })
  return {
    addCandlestickSeries: () => ({ setData, setMarkers }),
    addHistogramSeries: () => ({ setData }),
    addLineSeries: () => ({ setData }),
    applyOptions: () => undefined,
    priceScale,
    removeSeries: () => undefined,
    remove: () => undefined,
  }
}
