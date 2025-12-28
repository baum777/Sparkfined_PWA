import { useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ExtendedData, ExtendedDataSettings } from "@/features/journal/types";

interface ExtendedSectionsProps {
  extended?: ExtendedData;
  settings: ExtendedDataSettings;
  onRefresh?: () => void;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
        <span>{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ExtendedSections({ extended, settings, onRefresh }: ExtendedSectionsProps) {
  const hasAnySection = settings.marketContext || settings.technicalIndicators || settings.onChainMetrics;
  
  if (!hasAnySection) {
    return null;
  }

  const hasData = extended && (
    extended.marketContext || extended.technical || extended.onChain
  );

  return (
    <div className="mt-3 pt-3 border-t border-border-sf-subtle" data-testid="extended-sections">
      {/* Refresh button (UI only) */}
      {onRefresh && (
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 text-xs text-text-tertiary hover:text-text-primary gap-1.5"
            data-testid="refresh-extended-btn"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      )}

      {!hasData && (
        <p className="text-xs text-text-tertiary py-2">
          Extended data not available
        </p>
      )}

      {/* Market Context Section */}
      {settings.marketContext && extended?.marketContext && (
        <Section title="Market Context" defaultOpen>
          <div className="flex flex-wrap gap-2">
            {extended.marketContext.marketCapCategory && (
              <Badge variant="secondary" className="text-[10px] bg-surface-hover border-0">
                {extended.marketContext.marketCapCategory.toUpperCase()} CAP
              </Badge>
            )}
            {extended.marketContext.marketCap && (
              <Badge variant="secondary" className="text-[10px] bg-surface-hover border-0">
                MCap: {formatUsd(extended.marketContext.marketCap)}
              </Badge>
            )}
            {extended.marketContext.volume24h && (
              <Badge variant="secondary" className="text-[10px] bg-surface-hover border-0">
                Vol 24h: {formatUsd(extended.marketContext.volume24h)}
              </Badge>
            )}
          </div>
        </Section>
      )}

      {/* Technical Section */}
      {settings.technicalIndicators && extended?.technical && (
        <Section title="Technical">
          <div className="flex flex-wrap gap-2">
            {extended.technical.rsi !== undefined && (
              <Badge 
                variant="secondary" 
                className={`text-[10px] border-0 ${
                  extended.technical.rsiCondition === "oversold"
                    ? "bg-sentiment-bull-bg text-sentiment-bull"
                    : extended.technical.rsiCondition === "overbought"
                    ? "bg-sentiment-bear-bg text-sentiment-bear"
                    : "bg-surface-hover text-text-secondary"
                }`}
              >
                RSI: {extended.technical.rsi.toFixed(0)} ({extended.technical.rsiCondition})
              </Badge>
            )}
          </div>
        </Section>
      )}

      {/* On-Chain Section */}
      {settings.onChainMetrics && extended?.onChain && (
        <Section title="On-Chain">
          <div className="flex flex-wrap gap-2">
            {extended.onChain.holderCount !== undefined && (
              <Badge variant="secondary" className="text-[10px] bg-surface-hover border-0">
                Holders: {extended.onChain.holderCount.toLocaleString()}
              </Badge>
            )}
            {extended.onChain.whaleConcentration !== undefined && (
              <Badge 
                variant="secondary" 
                className={`text-[10px] border-0 ${
                  extended.onChain.whaleConcentration > 50
                    ? "bg-sentiment-bear-bg text-sentiment-bear"
                    : "bg-surface-hover text-text-secondary"
                }`}
              >
                Whales: {extended.onChain.whaleConcentration}%
              </Badge>
            )}
            {extended.onChain.tokenMaturity && (
              <Badge variant="secondary" className="text-[10px] bg-surface-hover border-0">
                {extended.onChain.tokenMaturity}
              </Badge>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
