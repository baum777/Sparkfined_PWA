import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Logo from '../Logo'

describe('Logo', () => {
  it('renders without crashing', () => {
    const { container } = render(<Logo />)
    expect(container).toBeTruthy()
  })

  it('displays the letter S', () => {
    const { getByText } = render(<Logo />)
    expect(getByText('S')).toBeTruthy()
  })
})
