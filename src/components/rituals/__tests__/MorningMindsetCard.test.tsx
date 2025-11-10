/**
 * MorningMindsetCard Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MorningMindsetCard } from '../MorningMindsetCard';
import * as storage from '../../../lib/storage/localRitualStore';

// Mock storage functions
vi.mock('../../../lib/storage/localRitualStore', () => ({
  getTodaysRitual: vi.fn(),
  saveDailyRitual: vi.fn(),
  markRitualComplete: vi.fn(),
}));

// Mock telemetry
vi.mock('../../../lib/telemetry/emitEvent', () => ({
  emitRitualEvent: vi.fn(),
  RitualEvents: {
    MORNING_OPEN: 'ritual.morning_open',
    GOAL_SET: 'ritual.goal_set',
    RITUAL_COMPLETE: 'ritual.complete',
  },
}));

describe('MorningMindsetCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render in edit mode when no ritual exists', () => {
    vi.mocked(storage.getTodaysRitual).mockReturnValue(null);

    render(<MorningMindsetCard />);

    expect(screen.getByText('Morning Mindset')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ich handle nach Plan/i)).toBeInTheDocument();
    expect(screen.getByText('Ziel setzen')).toBeInTheDocument();
  });

  it('should allow setting a goal and mood', async () => {
    vi.mocked(storage.getTodaysRitual).mockReturnValue(null);
    vi.mocked(storage.saveDailyRitual).mockResolvedValue({
      date: '2025-11-10',
      goalHash: 'abc123',
      goal: 'Heute nur Setups handeln',
      mood: 'calm',
      completed: false,
      streak: 1,
      createdAt: new Date().toISOString(),
      synced: false,
    });

    render(<MorningMindsetCard />);

    const textarea = screen.getByPlaceholderText(/Ich handle nach Plan/i);
    fireEvent.change(textarea, { target: { value: 'Heute nur Setups handeln' } });

    const calmButton = screen.getByText('Ruhig');
    fireEvent.click(calmButton);

    const submitButton = screen.getByText('Ziel setzen');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(storage.saveDailyRitual).toHaveBeenCalledWith('Heute nur Setups handeln', 'calm', false);
    });
  });

  it('should display saved ritual', () => {
    vi.mocked(storage.getTodaysRitual).mockReturnValue({
      date: '2025-11-10',
      goalHash: 'abc123',
      goal: 'Nur Setups handeln',
      mood: 'calm',
      completed: false,
      streak: 3,
      createdAt: new Date().toISOString(),
      synced: false,
    });

    render(<MorningMindsetCard />);

    expect(screen.getByText('Nur Setups handeln')).toBeInTheDocument();
    expect(screen.getByText('3 Tage')).toBeInTheDocument();
    expect(screen.getByText('Abgeschlossen')).toBeInTheDocument();
  });

  it('should mark ritual as complete', async () => {
    const mockRitual = {
      date: '2025-11-10',
      goalHash: 'abc123',
      goal: 'Nur Setups handeln',
      mood: 'calm' as const,
      completed: false,
      streak: 3,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    vi.mocked(storage.getTodaysRitual).mockReturnValue(mockRitual);
    vi.mocked(storage.markRitualComplete).mockReturnValue({
      ...mockRitual,
      completed: true,
      streak: 4,
    });

    const onComplete = vi.fn();
    render(<MorningMindsetCard onComplete={onComplete} />);

    const completeButton = screen.getByText('Abgeschlossen');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(storage.markRitualComplete).toHaveBeenCalledWith('2025-11-10');
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should show streak badge', () => {
    vi.mocked(storage.getTodaysRitual).mockReturnValue({
      date: '2025-11-10',
      goalHash: 'abc123',
      goal: 'Test goal',
      mood: 'neutral',
      completed: false,
      streak: 7,
      createdAt: new Date().toISOString(),
      synced: false,
    });

    render(<MorningMindsetCard />);

    expect(screen.getByText('7 Tage')).toBeInTheDocument();
  });

  it('should disable save button when goal is empty', () => {
    vi.mocked(storage.getTodaysRitual).mockReturnValue(null);

    render(<MorningMindsetCard />);

    const submitButton = screen.getByText('Ziel setzen');
    expect(submitButton).toBeDisabled();
  });
});
