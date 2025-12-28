import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { RightSheet, RightSheetSection, RightSheetFooter } from '@/components/ui/RightSheet';
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

interface AlertCreateDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  triggerButton?: boolean;
}

export default function AlertCreateDialog({ isOpen: controlledIsOpen, onClose, triggerButton = true }: AlertCreateDialogProps) {
  const createAlert = useAlertsStore((state) => state.createAlert);
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<FormState>(() => getDefaultFormState());
  const [errors, setErrors] = React.useState<FormErrors>(() => getDefaultErrors());
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isOpen = controlledIsOpen ?? internalIsOpen;

  const resetForm = React.useCallback(() => {
    setFormState(getDefaultFormState());
    setErrors(getDefaultErrors());
  }, []);

  const closeSheet = React.useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    resetForm();
  }, [onClose, resetForm]);

  const openSheet = React.useCallback(() => {
    resetForm();
    setInternalIsOpen(true);
  }, [resetForm]);

  const handleSubmit = () => {
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
      closeSheet();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {triggerButton && (
        <Button
          size="sm"
          variant="primary"
          onClick={openSheet}
          data-testid="alerts-new-alert-button"
        >
          New alert
        </Button>
      )}

      <RightSheet
        isOpen={isOpen}
        onClose={closeSheet}
        title="New alert"
        subtitle="Define the symbol, threshold, and cadence for your price alert."
        width="md"
        data-testid="alert-create-dialog"
        footer={
          <RightSheetFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSheet}
              disabled={isSubmitting}
              data-testid="alert-cancel-button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={isSubmitting}
              data-testid="alert-submit-button"
            >
              Save alert
            </Button>
          </RightSheetFooter>
        }
      >
        <div className="space-y-4" data-testid="alert-create-form">
          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Symbol</span>
              <Input
                value={formState.symbol}
                onChange={(event) => setFormState((prev) => ({ ...prev, symbol: event.target.value }))}
                placeholder="BTCUSDT"
                autoFocus
                data-testid="alert-symbol-input"
                error={errors.symbol}
                errorTestId="alert-symbol-error"
              />
            </label>
          </RightSheetSection>

          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Type</span>
              <Select
                options={ALERT_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={formState.type}
                onChange={(value) => setFormState((prev) => ({ ...prev, type: value as AlertType }))}
                triggerProps={{ 'data-testid': 'alert-type-select' }}
              />
            </label>
          </RightSheetSection>

          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Condition</span>
              <Input
                value={formState.condition}
                onChange={(event) => setFormState((prev) => ({ ...prev, condition: event.target.value }))}
                placeholder="Alert when price closes above threshold"
                data-testid="alert-condition-input"
                error={errors.condition}
                errorTestId="alert-condition-error"
              />
            </label>
          </RightSheetSection>

          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Threshold</span>
              <Input
                type="number"
                step="any"
                value={formState.threshold}
                onChange={(event) => setFormState((prev) => ({ ...prev, threshold: event.target.value }))}
                placeholder="42500"
                data-testid="alert-threshold-input"
                error={errors.threshold}
                errorTestId="alert-threshold-error"
              />
            </label>
          </RightSheetSection>

          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Timeframe</span>
              <Select
                options={TIMEFRAME_OPTIONS.map((value) => ({ value, label: value.toUpperCase() }))}
                value={formState.timeframe}
                onChange={(value) => setFormState((prev) => ({ ...prev, timeframe: value }))}
                triggerProps={{ 'data-testid': 'alert-timeframe-select' }}
              />
            </label>
          </RightSheetSection>
        </div>
      </RightSheet>
    </>
  );
}
