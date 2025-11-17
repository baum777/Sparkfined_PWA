import '@testing-library/jest-dom';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../AdvancedInsightCard', () => import('./AdvancedInsightCard.test-double'));

import AdvancedInsightCard, { __setAdvancedInsightTestScenario } from '../AdvancedInsightCard';
import { generateMockAdvancedInsight } from '../mockAdvancedInsightData';

vi.mock('../advancedInsightTelemetry', () => {
  const noop = () => {};
  return {
    useAdvancedInsightTelemetry: () => ({
      trackOpened: noop,
      trackTabSwitched: noop,
      trackFieldOverridden: noop,
      trackSaved: noop,
      trackReset: noop,
      trackResetAll: noop,
      trackUnlockClicked: noop,
    }),
  };
});

function setUnlockedScenario() {
  __setAdvancedInsightTestScenario({
    locked: false,
    insight: generateMockAdvancedInsight('SOL', 48),
  });
}

function setLockedScenario() {
  __setAdvancedInsightTestScenario({
    locked: true,
    insight: generateMockAdvancedInsight('SOL', 48),
  });
}

describe('AdvancedInsightCard component', () => {
  beforeEach(() => {
    setUnlockedScenario();
    vi.clearAllMocks();
  });

  it('renders unlocked card with tabs and ARIA wiring', () => {
    render(<AdvancedInsightCard />);

    const tablist = screen.getByRole('tablist', { name: /advanced insight sections/i });
    expect(tablist).toBeInTheDocument();

    const marketTab = screen.getByRole('tab', { name: /market structure/i });
    expect(marketTab).toHaveAttribute('aria-selected', 'true');

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', marketTab.getAttribute('id'));

    expect(screen.getByText(/Range Structure/i)).toBeInTheDocument();
  });

  it('switches tabs when user selects Flow/Volume', async () => {
    render(<AdvancedInsightCard />);
    const user = userEvent.setup();

    const flowTab = screen.getByRole('tab', { name: /Flow\/Volume/i });
    await user.click(flowTab);

    expect(flowTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Volume \(USD\)/i)).toBeVisible();

    const marketTab = screen.getByRole('tab', { name: /Market Structure/i });
    expect(marketTab).toHaveAttribute('aria-selected', 'false');
  });

  it('allows editing playbook entries inline', async () => {
    render(<AdvancedInsightCard />);
    const user = userEvent.setup();

    const editButton = screen.getByRole('button', { name: /Edit playbook entries/i });
    await user.click(editButton);

    const textarea = screen.getByLabelText(/Edit tactical playbook entries/i);
    await user.type(textarea, '\nNew entry from test');

    await user.click(screen.getByRole('button', { name: /^Save$/i }));

    expect(screen.getByText(/New entry from test/i)).toBeInTheDocument();
    expect(screen.getByText('Edited')).toBeInTheDocument();
  });

  it('shows lock overlay with accessible unlock CTA', () => {
    setLockedScenario();
    render(<AdvancedInsightCard />);

    expect(screen.getByText(/Advanced Insight Locked/i)).toBeVisible();
    const unlockLink = screen.getByRole('link', { name: /Unlock advanced insight access/i });
    expect(unlockLink).toBeVisible();
    expect(unlockLink).toHaveAttribute('href', '/access');
  });
});
