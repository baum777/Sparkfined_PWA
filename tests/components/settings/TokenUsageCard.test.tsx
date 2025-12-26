import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TokenUsageCard from '@/features/settings/TokenUsageCard'

describe('TokenUsageCard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows a warning when storage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined as unknown as Storage)

    render(<TokenUsageCard />)

    expect(screen.getByRole('alert')).toHaveTextContent(/Local storage is unavailable/i)
  })
})
