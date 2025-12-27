import React from "react";
import { Button, Input, Select } from "@/components/ui";
import Modal from "@/components/ui/Modal";
import type { AlertType } from "@/store/alertsStore";
import { useAlertsStore } from "@/store/alertsStore";
import { AlertTemplates, type AlertTemplate } from "@/features/alerts/AlertTemplates";
import { SymbolAutocomplete } from "@/features/alerts/SymbolAutocomplete";
import type { AlertPrefillValues } from "@/features/alerts/prefill";

const ALERT_TYPE_OPTIONS = [
  { value: "price-above", label: "Price goes above" },
  { value: "price-below", label: "Price goes below" },
] as const;

const TIMEFRAME_OPTIONS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

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

type NewAlertSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (alertId: string) => void;
  prefill?: AlertPrefillValues | null;
};

const getDefaultFormState = (): FormState => ({
  symbol: "",
  type: "price-above",
  condition: "",
  threshold: "",
  timeframe: "1h",
});

const getDefaultErrors = (): FormErrors => ({
  symbol: "",
  condition: "",
  threshold: "",
});

const buildPrefillState = (prefill: AlertPrefillValues): Partial<FormState> => ({
  ...(prefill.symbol ? { symbol: prefill.symbol } : {}),
  ...(prefill.type ? { type: prefill.type } : {}),
  ...(prefill.condition ? { condition: prefill.condition } : {}),
  ...(prefill.threshold ? { threshold: prefill.threshold } : {}),
  ...(prefill.timeframe ? { timeframe: prefill.timeframe } : {}),
});

const hasFormChanges = (state: FormState) =>
  Boolean(
    state.symbol.trim() ||
      state.condition.trim() ||
      state.threshold.trim() ||
      state.type !== "price-above" ||
      state.timeframe !== "1h",
);

export default function NewAlertSheet({ isOpen, onClose, onCreated, prefill }: NewAlertSheetProps) {
  const createAlert = useAlertsStore((state) => state.createAlert);
  const [formState, setFormState] = React.useState<FormState>(() => getDefaultFormState());
  const [errors, setErrors] = React.useState<FormErrors>(() => getDefaultErrors());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);
  const lastPrefillRef = React.useRef<string | null>(null);

  const resetForm = React.useCallback(() => {
    setFormState(getDefaultFormState());
    setErrors(getDefaultErrors());
    setSubmissionError(null);
  }, []);

  const closeSheet = React.useCallback(() => {
    onClose();
    resetForm();
  }, [onClose, resetForm]);

  React.useEffect(() => {
    if (!isOpen) {
      lastPrefillRef.current = null;
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || !prefill) return;
    const prefillKey = JSON.stringify(prefill);
    if (prefillKey === lastPrefillRef.current) return;
    if (hasFormChanges(formState)) return;

    lastPrefillRef.current = prefillKey;
    setFormState((prev) => ({
      ...prev,
      ...buildPrefillState(prefill),
    }));
    setErrors(getDefaultErrors());
    setSubmissionError(null);
  }, [formState, isOpen, prefill]);

  const handleApplyTemplate = (template: AlertTemplate) => {
    if (hasFormChanges(formState)) {
      const confirmed = window.confirm(
        "Applying a template will overwrite your current alert fields. Continue?",
      );
      if (!confirmed) return;
    }

    setFormState((prev) => ({
      ...prev,
      ...template.preset,
    }));
    setErrors(getDefaultErrors());
    setSubmissionError(null);
  };

  const handleSubmit = () => {
    const nextErrors = getDefaultErrors();
    const normalizedSymbol = formState.symbol.trim().toUpperCase();
    const normalizedCondition = formState.condition.trim();
    const rawThreshold = formState.threshold.trim();
    const parsedThreshold = Number(rawThreshold);

    if (!normalizedSymbol) {
      nextErrors.symbol = "Symbol is required.";
    }
    if (normalizedCondition.length < 5) {
      nextErrors.condition = "Condition must be at least 5 characters.";
    }
    if (!rawThreshold || Number.isNaN(parsedThreshold)) {
      nextErrors.threshold = "Threshold must be a valid number.";
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setErrors(nextErrors);
      return;
    }

    setErrors(getDefaultErrors());
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const created = createAlert({
        symbol: normalizedSymbol,
        type: formState.type,
        condition: normalizedCondition,
        threshold: parsedThreshold,
        timeframe: formState.timeframe,
      });
      onCreated?.(created.id);
      closeSheet();
    } catch (error) {
      console.warn("NewAlertSheet: failed to create alert", error);
      setSubmissionError("We couldn't save that alert. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeSheet}
      title="New alert"
      subtitle="Set a symbol, trigger direction, and threshold to watch."
      size="lg"
      className="max-h-[calc(100vh-4rem)] overflow-hidden"
    >
      <div className="flex min-h-0 flex-col" data-testid="alert-create-dialog">
        <div className="sf-alerts-new min-h-0 flex-1 overflow-y-auto pr-1" data-testid="alert-create-form">
          {submissionError ? (
            <div className="sf-alerts-new__error" role="alert">
              {submissionError}
            </div>
          ) : null}

          <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
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
          </div>

          <div className="space-y-6">
            <div>
              <AlertTemplates onApply={handleApplyTemplate} />
            </div>

            <div>
              <SymbolAutocomplete
                value={formState.symbol}
                onChange={(value) => setFormState((prev) => ({ ...prev, symbol: value }))}
                label="Symbol"
                placeholder="BTCUSDT"
                error={errors.symbol}
                required
                dataTestId="alert-symbol-input"
              />
            </div>

            <div className="sf-alerts-new__builder">
              <div className="sf-alerts-new__builder-header">
                <div>
                  <span className="sf-alerts-new__builder-title">Condition builder</span>
                  <p className="sf-alerts-new__builder-help">
                    Choose the direction and threshold for your price alert.
                  </p>
                </div>
              </div>
              <div className="sf-alerts-new__builder-row">
                <div className="sf-alerts-new__builder-field">
                  <span className="sf-alerts-new__builder-label">Direction</span>
                  <Select
                    options={ALERT_TYPE_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    value={formState.type}
                    onChange={(value) => setFormState((prev) => ({ ...prev, type: value as AlertType }))}
                    triggerProps={{ "data-testid": "alert-type-select", "aria-label": "Direction" }}
                  />
                </div>
                <div className="sf-alerts-new__builder-field">
                  <span className="sf-alerts-new__builder-label">Threshold</span>
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
                </div>
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Condition details</span>
              <Input
                value={formState.condition}
                onChange={(event) => setFormState((prev) => ({ ...prev, condition: event.target.value }))}
                placeholder="Alert when price closes above threshold"
                data-testid="alert-condition-input"
                error={errors.condition}
                errorTestId="alert-condition-error"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Timeframe</span>
              <Select
                options={TIMEFRAME_OPTIONS.map((value) => ({ value, label: value.toUpperCase() }))}
                value={formState.timeframe}
                onChange={(value) => setFormState((prev) => ({ ...prev, timeframe: value }))}
                triggerProps={{ "data-testid": "alert-timeframe-select", "aria-label": "Timeframe" }}
              />
            </label>
          </div>
        </div>
      </div>
    </Modal>
  )
}
