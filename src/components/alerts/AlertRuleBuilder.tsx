import React, { useState } from 'react';
import type { AlertRule } from '@/types/confluence-alerts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// ============================================================================
// ALERT RULE BUILDER
// ============================================================================

type AlertRuleBuilderProps = {
  initialRule?: AlertRule;
  onSave: (rule: AlertRule) => void;
  onCancel: () => void;
};

export default function AlertRuleBuilder({ initialRule, onSave, onCancel }: AlertRuleBuilderProps) {
  const [ruleName, setRuleName] = useState(initialRule?.name || '');
  const [ruleDescription, setRuleDescription] = useState(initialRule?.description || '');

  // TODO Codex: Implement full rule builder with conditions, actions, time restrictions
  // This is a skeleton - implement the full visual builder

  return (
    <div className="space-y-6">
      {/* ========== RULE HEADER ========== */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Alert Rule Builder</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-text-primary">Rule Name</label>
            <Input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="e.g., FVG + Liquidity Sweep Confluence"
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary">
              Description (Optional)
            </label>
            <textarea
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
              placeholder="Describe when this alert should trigger..."
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </Card>

      {/* ========== CONDITIONS ========== */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-primary">Conditions</h4>
        <p className="mb-4 text-xs text-text-secondary">
          Define when this alert should trigger (Price AND Volume AND RSI...)
        </p>

        {/* TODO Codex: Implement condition builder */}
        <div className="space-y-2">
          <div className="rounded-lg border border-border-subtle bg-surface-elevated p-3">
            <p className="text-xs text-text-secondary">
              TODO Codex: Implement AlertConditionEditor component
            </p>
            <ul className="mt-2 space-y-1 text-xs text-text-tertiary">
              <li>• Price condition (greater than, less than, etc.)</li>
              <li>• Volume condition (spike, percent of average)</li>
              <li>• RSI condition (overbought, oversold)</li>
              <li>• MACD condition (bullish cross, bearish cross)</li>
              <li>• ICT conditions (FVG, Order Block, Liquidity Sweep)</li>
            </ul>
          </div>

          <Button variant="outline" size="sm">
            + Add Condition
          </Button>
        </div>

        {/* Operator Toggle (AND/OR) */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-text-secondary">Operator:</span>
          <button
            type="button"
            className="rounded-full border border-brand bg-surface-hover px-3 py-1 text-xs font-semibold text-text-primary"
          >
            AND
          </button>
          <span className="text-text-tertiary">(All conditions must be met)</span>
        </div>
      </Card>

      {/* ========== ACTIONS ========== */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-primary">Actions</h4>
        <p className="mb-4 text-xs text-text-secondary">
          What should happen when the alert triggers?
        </p>

        {/* TODO Codex: Implement action selector */}
        <div className="space-y-2">
          <ActionPlaceholder
            type="push-notification"
            title="Push Notification"
            enabled
          />
          <ActionPlaceholder
            type="create-journal-entry"
            title="Create Journal Entry"
            enabled
          />
          <ActionPlaceholder type="play-sound" title="Play Sound" enabled={false} />

          <Button variant="outline" size="sm">
            + Add Action
          </Button>
        </div>
      </Card>

      {/* ========== TIME RESTRICTIONS ========== */}
      <Card className="p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-primary">
          Time Restrictions (Optional)
        </h4>
        <p className="mb-4 text-xs text-text-secondary">
          Limit when this alert can trigger (e.g., only during London Killzone)
        </p>

        {/* TODO Codex: Implement time restriction selector */}
        <div className="rounded-lg border border-border-subtle bg-surface-elevated p-3">
          <p className="text-xs text-text-secondary">
            TODO Codex: Implement TimeRestrictionSelector component
          </p>
          <ul className="mt-2 space-y-1 text-xs text-text-tertiary">
            <li>• Session restriction (Asian, London, NY, Sydney)</li>
            <li>• Killzone restriction (London Killzone, NY AM Killzone, etc.)</li>
            <li>• Weekday restriction (Monday, Tuesday, etc.)</li>
            <li>• Custom time range (HH:MM - HH:MM)</li>
          </ul>
        </div>

        <Button variant="outline" size="sm" className="mt-2">
          + Add Time Restriction
        </Button>
      </Card>

      {/* ========== FOOTER ACTIONS ========== */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            // TODO Codex: Build AlertRule object and call onSave
            console.log('[AlertRuleBuilder] Save clicked - TODO: Implement');
          }}
          disabled={!ruleName.trim()}
        >
          Save Rule
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// ACTION PLACEHOLDER
// ============================================================================

type ActionPlaceholderProps = {
  type: string;
  title: string;
  enabled: boolean;
};

function ActionPlaceholder({ type, title, enabled }: ActionPlaceholderProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={`text-xs ${enabled ? 'text-sentiment-bull' : 'text-text-tertiary'}`}>
          {enabled ? '✓' : '○'}
        </span>
        <span className="text-sm text-text-primary">{title}</span>
      </div>
      <button className="text-xs text-text-secondary hover:text-text-primary">
        Edit
      </button>
    </div>
  );
}
