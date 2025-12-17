import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EmotionalSlider } from '@/components/journal/EmotionalSlider'

describe('EmotionalSlider', () => {
  it('renders and emits onChange with a 0–100 value', () => {
    const onChange = vi.fn()
    render(<EmotionalSlider value={50} onChange={onChange} ariaLabel="Emotional position" data-testid="slider" />)

    const slider = screen.getByTestId('slider')
    expect(slider).toHaveAttribute('type', 'range')

    fireEvent.change(slider, { target: { value: '80' } })
    expect(onChange).toHaveBeenCalledWith(80)
  })

  it('updates aria-valuetext based on the 5-zone mapping', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <EmotionalSlider value={10} onChange={onChange} ariaLabel="Emotional position" data-testid="slider" />,
    )

    const slider = screen.getByTestId('slider')
    expect(slider).toHaveAttribute('aria-valuetext', 'Sehr unsicher')

    rerender(<EmotionalSlider value={50} onChange={onChange} ariaLabel="Emotional position" data-testid="slider" />)
    expect(slider).toHaveAttribute('aria-valuetext', 'Neutral')

    rerender(<EmotionalSlider value={95} onChange={onChange} ariaLabel="Emotional position" data-testid="slider" />)
    expect(slider).toHaveAttribute('aria-valuetext', 'Sehr optimistisch')
  })
})

