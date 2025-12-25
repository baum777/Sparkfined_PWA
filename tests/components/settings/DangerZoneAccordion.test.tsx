import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import DangerZoneAccordion from '@/features/settings/DangerZoneAccordion'

describe('DangerZoneAccordion', () => {
  it('is collapsed by default and expands on click', async () => {
    const user = userEvent.setup()
    render(<DangerZoneAccordion />)

    const toggle = screen.getByRole('button', { name: /Destructive actions/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Factory reset workspace/i)).toBeInTheDocument()
  })

  it('requires confirmation before executing actions', async () => {
    const user = userEvent.setup()
    render(<DangerZoneAccordion />)

    await user.click(screen.getByRole('button', { name: /Destructive actions/i }))

    const actionRow = screen.getAllByRole('listitem')[0]!
    const actionButton = within(actionRow).getByRole('button', { name: /Prepare/i })
    await user.click(actionButton)
    expect(actionButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/Click the highlighted action again to confirm/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Confirm/i }))
    expect(screen.getByText(/acknowledged/)).toBeInTheDocument()
  })
})
