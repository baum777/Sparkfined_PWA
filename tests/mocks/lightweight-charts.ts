export const CrosshairMode = { Normal: 'Normal' }

export const createChart = () => {
  const setData = () => undefined
  const setMarkers = () => undefined
  const applyOptions = () => undefined
  return {
    addCandlestickSeries: () => ({ setData, setMarkers }),
    addHistogramSeries: () => ({ 
      setData, 
      priceScale: () => ({ applyOptions }) 
    }),
    addLineSeries: () => ({ setData }),
    applyOptions: () => undefined,
    removeSeries: () => undefined,
    remove: () => undefined,
  }
}
