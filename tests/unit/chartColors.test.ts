import { afterEach, describe, expect, test, vi } from 'vitest'

const loadChartColors = async () => import('@/lib/chartColors')

const mockStyleWithValue = (value: string) =>
  ({ getPropertyValue: vi.fn().mockReturnValue(value) } as unknown as CSSStyleDeclaration)

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

describe('chartColors warnings', () => {
  test('deduplicates missing token warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(mockStyleWithValue(''))

    const { getChartColor } = await loadChartColors()

    const first = getChartColor('--color-brand', '#112233')
    const second = getChartColor('--color-brand', '#112233')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      '[chartColors] Token "--color-brand" not found, using fallback',
    )
    expect(first).toBe('#112233')
    expect(second).toBe('#112233')
  })

  test('deduplicates invalid RGB warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(mockStyleWithValue('42'))

    const { getChartColor } = await loadChartColors()

    const first = getChartColor('--color-brand', '#445566')
    const second = getChartColor('--color-brand', '#445566')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      '[chartColors] Invalid RGB value for token "--color-brand": "42"',
    )
    expect(first).toBe('#445566')
    expect(second).toBe('#445566')
  })
})
