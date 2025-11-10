/**
 * PreTradeChecklistModal Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreTradeChecklistModal } from '../PreTradeChecklistModal';
import * as storage from '../../../lib/storage/localRitualStore';

// Mock storage
vi.mock('../../../lib/storage/localRitualStore', () => ({
  savePreTradeChecklist: vi.fn(),
}));

// Mock telemetry
vi.mock('../../../lib/telemetry/emitEvent', () => ({
  emitRitualEvent: vi.fn(),
  RitualEvents: {
    PRETRADE_OPEN: 'pretrade.open',
    PRETRADE_SUBMIT: 'pretrade.submit',
  },
}));

describe('PreTradeChecklistModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(<PreTradeChecklistModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText('Pre-Trade Checklist')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<PreTradeChecklistModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Pre-Trade Checklist')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('BTC/USDT')).toBeInTheDocument();
    expect(screen.getByText('Bestätigen')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<PreTradeChecklistModal isOpen={true} onClose={vi.fn()} />);

    const submitButton = screen.getByText('Bestätigen');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Symbol erforderlich/i)).toBeInTheDocument();
      expect(screen.getByText(/Thesis zu kurz/i)).toBeInTheDocument();
    });
  });

  it('should validate thesis length (min 10 chars)', async () => {
    render(<PreTradeChecklistModal isOpen={true} onClose={vi.fn()} />);

    const thesisInput = screen.getByPlaceholderText(/Warum dieser Trade/i);
    fireEvent.change(thesisInput, { target: { value: 'Short' } });

    const submitButton = screen.getByText('Bestätigen');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Thesis zu kurz/i)).toBeInTheDocument();
    });
  });

  it('should validate RR ratio > 0', async () => {
    render(<PreTradeChecklistModal isOpen={true} onClose={vi.fn()} />);

    const symbolInput = screen.getByPlaceholderText('BTC/USDT');
    fireEvent.change(symbolInput, { target: { value: 'BTC/USDT' } });

    const thesisInput = screen.getByPlaceholderText(/Warum dieser Trade/i);
    fireEvent.change(thesisInput, { target: { value: 'Valid thesis with more than 10 chars' } });

    const rrInput = screen.getByPlaceholderText('2.5');
    fireEvent.change(rrInput, { target: { value: '-1' } });

    const riskInput = screen.getByPlaceholderText('100');
    fireEvent.change(riskInput, { target: { value: '100' } });

    const submitButton = screen.getByText('Bestätigen');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/RR muss > 0 sein/i)).toBeInTheDocument();
    });
  });

  it('should submit valid checklist', async () => {
    const mockChecklist = {
      id: 'test-id',
      symbol: 'BTC/USDT',
      thesisHash: 'hash123',
      thesis: 'Valid thesis here with enough characters',
      rr: 2.5,
      riskAmount: 100,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    vi.mocked(storage.savePreTradeChecklist).mockResolvedValue(mockChecklist);

    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <PreTradeChecklistModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />
    );

    // Fill all required fields
    fireEvent.change(screen.getByPlaceholderText('BTC/USDT'), {
      target: { value: 'BTC/USDT' },
    });

    fireEvent.change(screen.getByPlaceholderText(/Warum dieser Trade/i), {
      target: { value: 'Valid thesis here with enough characters' },
    });

    fireEvent.change(screen.getByPlaceholderText('2.5'), {
      target: { value: '2.5' },
    });

    fireEvent.change(screen.getByPlaceholderText('100'), {
      target: { value: '100' },
    });

    const submitButton = screen.getByText('Bestätigen');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(storage.savePreTradeChecklist).toHaveBeenCalledWith(
        'BTC/USDT',
        'Valid thesis here with enough characters',
        2.5,
        100,
        undefined,
        undefined
      );
      expect(onSubmit).toHaveBeenCalledWith(mockChecklist);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should show warning when fields are incomplete', () => {
    render(<PreTradeChecklistModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Plan oder Panic/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<PreTradeChecklistModal isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /abbrechen/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
