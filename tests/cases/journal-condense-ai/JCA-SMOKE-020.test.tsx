import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAssist } from '@/sections/ai/useAssist'
import { AIProviderState } from '@/state/ai'

const SYSTEM = 'Du reduzierst Chart-Notizen auf das Wesentliche.'
const USER = 'Titel: Breakout Setup\nNotiz: Long an Daily SR, Stop unter Tages-Tief'

describe('JCA-SMOKE-020 — useAssist run() smoke test', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores condensed summary', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ ok: true, text: '- Kontext: ...' })
    } as Response)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AIProviderState>{children}</AIProviderState>
    )

    const { result } = renderHook(() => useAssist(), { wrapper })

    await act(async () => {
      await result.current.run(SYSTEM, USER)
    })

    expect(result.current.result?.ok).toBe(true)
    expect(result.current.result?.text).toContain('Kontext')
  })
})
