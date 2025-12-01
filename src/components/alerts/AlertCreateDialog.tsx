import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAlertsStore, type AlertType } from '@/store/alertsStore';

type FormState = {
  symbol: string;
  type: AlertType;
  condition: string;
  threshold: string;
  timeframe: string;
};

type FormErrors = {
  symbol: string;
  condition: string;
  threshold: string;
};

const ALERT_TYPE_OPTIONS = [
  { value: 'price-above', label: 'Price above threshold' },
  { value: 'price-below', label: 'Price below threshold' },
] as const;

const TIMEFRAME_OPTIONS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

const getDefaultFormState = (): FormState => ({
  symbol: '',
  type: 'price-above',
  condition: '',
  threshold: '',
  timeframe: '1h',
});

const getDefaultErrors = (): FormErrors => ({
  symbol: '',
  condition: '',
  threshold: '',
});

export default function AlertCreateDialog() {
  const createAlert = useAlertsStore((state) => state.createAlert);
  const [isOpen, setIsOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>(() => getDefaultFormState());
  const [errors, setErrors] = React.useState<FormErrors>(() => getDefaultErrors());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const dialogTitleId = React.useId();

  const resetForm = React.useCallback(() => {
    setFormState(getDefaultFormState());
    setErrors(getDefaultErrors());
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        closeDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, closeDialog]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      closeDialog();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = getDefaultErrors();
    const normalizedSymbol = formState.symbol.trim().toUpperCase();
    const normalizedCondition = formState.condition.trim();
    const rawThreshold = formState.threshold.trim();
    const parsedThreshold = Number(rawThreshold);

    if (!normalizedSymbol) {
      nextErrors.symbol = 'Symbol is required.';
    }
    if (normalizedCondition.length < 5) {
      nextErrors.condition = 'Condition must be at least 5 characters.';
    }
    if (!rawThreshold || Number.isNaN(parsedThreshold)) {
      nextErrors.threshold = 'Threshold must be a valid number.';
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setErrors(nextErrors);
      return;
    }

    setErrors(getDefaultErrors());
    setIsSubmitting(true);

    try {
      createAlert({
        symbol: normalizedSymbol,
        type: formState.type,
        condition: normalizedCondition,
        threshold: parsedThreshold,
        timeframe: formState.timeframe,
      });
      closeDialog();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="primary"
        onClick={() => setIsOpen(true)}
        data-testid="alerts-new-alert-button"
      >
        New alert
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/80 px-4 py-8 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          onMouseDown={handleOverlayClick}
          data-testid="alert-create-dialog"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-5 rounded-2xl border border-border-moderate bg-surface-elevated p-6 text-text-primary shadow-2xl"
            data-testid="alert-create-form"
          >
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-text-tertiary">Create alert</p>
              <h2 id={dialogTitleId} className="text-2xl font-semibold text-text-primary">
                New alert
              </h2>
              <p className="text-sm text-text-secondary">
                Define the symbol, threshold, and cadence for your next price alert.
              </p>
            </header>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="alert-symbol-input">
                  Symbol
                </label>
                <Input
                  id="alert-symbol-input"
                  value={formState.symbol}
                  onChange={(event) => setFormState((prev) => ({ ...prev, symbol: event.target.value }))}
                  placeholder="BTCUSDT"
                  autoFocus
                  data-testid="alert-symbol-input"
                  error={errors.symbol}
                  errorTestId="alert-symbol-error"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="alert-type-select">
                  Type
                </label>
                <Select
                  options={ALERT_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  value={formState.type}
                  onChange={(value) => setFormState((prev) => ({ ...prev, type: value as AlertType }))}
                  triggerProps={{ 'data-testid': 'alert-type-select', id: 'alert-type-select' }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="alert-condition-input">
                  Condition
                </label>
                <Input
                  id="alert-condition-input"
                  value={formState.condition}
                  onChange={(event) => setFormState((prev) => ({ ...prev, condition: event.target.value }))}
                  placeholder="Alert when price closes above threshold"
                  data-testid="alert-condition-input"
                  error={errors.condition}
                  errorTestId="alert-condition-error"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="alert-threshold-input">
                  Threshold
                </label>
                <Input
                  id="alert-threshold-input"
                  type="number"
                  step="any"
                  value={formState.threshold}
                  onChange={(event) => setFormState((prev) => ({ ...prev, threshold: event.target.value }))}
                  placeholder="42500"
                  data-testid="alert-threshold-input"
                  error={errors.threshold}
                  errorTestId="alert-threshold-error"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary" htmlFor="alert-timeframe-select">
                  Timeframe
                </label>
                <Select
                  options={TIMEFRAME_OPTIONS.map((value) => ({ value, label: value.toUpperCase() }))}
                  value={formState.timeframe}
                  onChange={(value) => setFormState((prev) => ({ ...prev, timeframe: value }))}
                  triggerProps={{ 'data-testid': 'alert-timeframe-select', id: 'alert-timeframe-select' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeDialog}
                disabled={isSubmitting}
                data-testid="alert-cancel-button"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting} data-testid="alert-submit-button">
                {isSubmitting ? 'Saving…' : 'Save alert'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

