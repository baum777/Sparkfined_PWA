const width = typeof process.stdout?.columns === 'number' ? process.stdout.columns : undefined

if (!width || !Number.isFinite(width) || width <= 0) {
  try {
    process.stdout.columns = 80
  } catch {
    // In some environments columns might be read-only; ignore if we cannot set it.
  }
}
