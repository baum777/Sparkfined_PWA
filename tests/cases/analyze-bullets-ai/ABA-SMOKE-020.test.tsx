import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAssist } from '@/sections/ai/useAssist'
import { AIProviderState } from '@/state/ai'
import vars from '../../fixtures/analyze-bullets-ai/sample-vars.json'

describe('ABA-SMOKE-020 — useAssist smoke flow', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('persists proxy response into hook state', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({
        ok: true,
        text: JSON.stringify({ bullets: ['A', 'B', 'C', 'D'] }),
        usage: { total_tokens: 480 },
      })
    } as Response)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AIProviderState>{children}</AIProviderState>
    )

    const { result } = renderHook(() => useAssist(), { wrapper })

    await act(async () => {
      await result.current.runTemplate('v1/analyze_bullets', vars)
    })

    expect(result.current.result?.ok).toBe(true)
    expect(result.current.result?.text).toContain('bullets')
    expect(result.current.loading).toBe(false)
  })
})
