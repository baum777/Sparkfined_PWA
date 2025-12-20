import React from "react";
import { Button } from "@/components/ui";
import type { AlertType } from "@/store/alertsStore";

type AlertTemplatePreset = {
  symbol?: string;
  type?: AlertType;
  condition?: string;
  threshold?: string;
  timeframe?: string;
};

export type AlertTemplate = {
  id: string;
  name: string;
  description: string;
  preset: AlertTemplatePreset;
};

export const DEFAULT_ALERT_TEMPLATES: AlertTemplate[] = [
  {
    id: "breakout-above",
    name: "Breakout Above",
    description: "Use when price pushes through resistance with momentum.",
    preset: {
      symbol: "BTCUSDT",
      type: "price-above",
      condition: "Alert when price closes above the breakout level.",
      threshold: "45000",
      timeframe: "1h",
    },
  },
  {
    id: "support-breakdown",
    name: "Support Breakdown",
    description: "Protect against breakdowns below key support.",
    preset: {
      symbol: "ETHUSDT",
      type: "price-below",
      condition: "Alert when price loses support on a closing basis.",
      threshold: "2200",
      timeframe: "4h",
    },
  },
  {
    id: "momentum-pop",
    name: "Momentum Pop",
    description: "Track fast moves above a momentum trigger.",
    preset: {
      symbol: "SOLUSDT",
      type: "price-above",
      condition: "Alert when price surges above the momentum trigger.",
      threshold: "125",
      timeframe: "15m",
    },
  },
  {
    id: "fade-pullback",
    name: "Fade Pullback",
    description: "Watch for dips below a defined pullback line.",
    preset: {
      symbol: "ADAUSDT",
      type: "price-below",
      condition: "Alert when price drops below the pullback line.",
      threshold: "0.52",
      timeframe: "1h",
    },
  },
];

type AlertTemplatesProps = {
  templates?: AlertTemplate[];
  onApply: (template: AlertTemplate) => void;
  onImport?: () => void;
};

const getTypeLabel = (type?: AlertType) => {
  if (type === "price-below") return "Below";
  if (type === "price-above") return "Above";
  return "Custom";
};

const formatTemplateMeta = (template: AlertTemplate) => {
  const items: string[] = [];
  if (template.preset.symbol) items.push(`Symbol ${template.preset.symbol}`);
  if (template.preset.threshold) items.push(`Threshold ${template.preset.threshold}`);
  if (template.preset.timeframe) items.push(`Timeframe ${template.preset.timeframe.toUpperCase()}`);
  return items;
};

export function AlertTemplates({ templates = DEFAULT_ALERT_TEMPLATES, onApply, onImport }: AlertTemplatesProps) {
  const importLabel = onImport ? "Import presets" : "Import (stub)";
  const metaByTemplate = React.useMemo(
    () =>
      new Map(
        templates.map((template) => {
          return [template.id, formatTemplateMeta(template)];
        }),
      ),
    [templates],
  );

  return (
    <section className="sf-alerts-templates" aria-labelledby="alert-templates-title">
      <div className="sf-alerts-templates__header">
        <div>
          <span id="alert-templates-title" className="sf-alerts-templates__title">
            Templates
          </span>
          <p className="sf-alerts-templates__subtitle">Pick a preset to prefill the new alert.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!onImport}
          onClick={onImport}
          data-testid="alert-templates-import"
        >
          {importLabel}
        </Button>
      </div>
      <div className="sf-alerts-templates__grid" data-testid="alert-templates-list">
        {templates.map((template) => {
          const typeLabel = getTypeLabel(template.preset.type);
          const metaItems = metaByTemplate.get(template.id) ?? [];
          return (
            <article key={template.id} className="sf-alerts-templates__card">
              <div className="sf-alerts-templates__card-body">
                <div className="sf-alerts-templates__card-header">
                  <span className="sf-alerts-templates__card-title">{template.name}</span>
                  <span className="sf-alerts-templates__chip">{typeLabel}</span>
                </div>
                <p className="sf-alerts-templates__card-description">{template.description}</p>
                {metaItems.length ? (
                  <div className="sf-alerts-templates__meta">
                    {metaItems.map((item) => (
                      <span key={item} className="sf-alerts-templates__meta-item">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApply(template)}
                aria-label={`Apply ${template.name} template`}
                data-testid={`alert-template-apply-${template.id}`}
              >
                Apply
              </Button>
            </article>
          );
        })}
      </div>
      <p className="sf-alerts-templates__hint">
        Import is stubbed for now. Paste-ready JSON and provider presets will follow in a later polish pass.
      </p>
    </section>
  );
}
