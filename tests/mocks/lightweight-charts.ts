export const CrosshairMode = { Normal: 'Normal' }

export const createChart = () => {
  const setData = () => undefined
  const setMarkers = () => undefined
  return {
    addCandlestickSeries: () => ({ setData, setMarkers }),
    addHistogramSeries: () => ({ setData }),
    addLineSeries: () => ({ setData }),
    applyOptions: () => undefined,
    removeSeries: () => undefined,
    remove: () => undefined,
  }
}
