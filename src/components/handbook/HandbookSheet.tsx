import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHandbookPanel } from "@/hooks/useHandbookPanel";
import { useHandbookActionDispatcher } from "@/lib/handbook/dispatchHandbookAction";
import { useHandbookContext, checkGate } from "@/lib/handbook/handbookContext";
import { DemoGateToggle } from "./DemoGateToggle";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle2, Circle, AlertTriangle, ExternalLink } from "lucide-react";
import type { HandbookFlow, HandbookStep, HandbookPrerequisite, HandbookPitfall } from "@/lib/handbook/types";

function StepCard({ step, index }: { step: HandbookStep; index: number }) {
  const dispatch = useHandbookActionDispatcher();
  
  return (
    <div className="relative pl-8 pb-4 last:pb-0">
      <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand/20 text-brand text-xs font-medium">
        {index + 1}
      </div>
      <div className="absolute left-3 top-6 bottom-0 w-px bg-border-sf-subtle last:hidden" />
      <div className="space-y-1.5">
        <h4 className="text-sm font-medium text-text-primary">{step.title}</h4>
        <p className="text-xs text-text-secondary"><span className="text-text-tertiary">You:</span> {step.userAction}</p>
        <p className="text-xs text-text-secondary"><span className="text-text-tertiary">App:</span> {step.systemBehavior}</p>
        <p className="text-xs text-brand">{step.outcome}</p>
        {step.cta && (
          <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => dispatch(step.cta!.action)}>
            {step.cta.label}
          </Button>
        )}
      </div>
    </div>
  );
}

function FlowSection({ flow }: { flow: HandbookFlow }) {
  const [open, setOpen] = React.useState(flow.level === "basic");
  
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border border-border-sf-subtle rounded-lg">
      <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-surface-hover rounded-t-lg">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-text-tertiary" /> : <ChevronRight className="h-4 w-4 text-text-tertiary" />}
          <span className="text-sm font-medium text-text-primary">{flow.title}</span>
          <Badge variant="outline" className="text-[10px]">{flow.level}</Badge>
        </div>
        <span className="text-xs text-text-tertiary">{flow.steps.length} steps</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-3 pt-0 space-y-2">
        {flow.steps.map((step, i) => <StepCard key={step.id} step={step} index={i} />)}
        {flow.branches?.map((branch, i) => (
          <div key={i} className="mt-3 pl-4 border-l-2 border-dashed border-text-tertiary/30">
            <p className="text-xs text-text-tertiary mb-2">Branch: {branch.when}</p>
            {branch.steps.map((step, j) => <StepCard key={step.id} step={step} index={j} />)}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Checklist tab with dynamic gate checking
function ChecklistTab({ prerequisites }: { prerequisites: HandbookPrerequisite[] }) {
  const context = useHandbookContext();
  const dispatch = useHandbookActionDispatcher();

  if (prerequisites.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="h-8 w-8 text-brand mx-auto mb-2" />
        <p className="text-sm text-text-secondary">No prerequisites for this page.</p>
        <p className="text-xs text-text-tertiary mt-1">You're ready to use all features!</p>
      </div>
    );
  }

  const completed = prerequisites.filter((p) => checkGate(p.gate, context)).length;
  const total = prerequisites.length;
  const allComplete = completed === total;

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-border-sf-subtle">
        <div className="flex items-center gap-2">
          {allComplete ? (
            <CheckCircle2 className="h-5 w-5 text-brand" />
          ) : (
            <Circle className="h-5 w-5 text-text-tertiary" />
          )}
          <span className="text-sm font-medium text-text-primary">
            {allComplete ? "All set!" : "Setup Progress"}
          </span>
        </div>
        <Badge 
          variant={allComplete ? "default" : "secondary"} 
          className={allComplete ? "bg-brand text-black" : ""}
        >
          {completed}/{total}
        </Badge>
      </div>

      {/* Individual prerequisites */}
      {prerequisites.map((prereq) => {
        const isSatisfied = checkGate(prereq.gate, context);
        
        return (
          <div 
            key={prereq.id} 
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              isSatisfied 
                ? "bg-brand/5 border-brand/20" 
                : "bg-surface-subtle border-border-sf-subtle"
            }`}
          >
            {isSatisfied ? (
              <CheckCircle2 className="h-5 w-5 text-brand mt-0.5 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-text-tertiary mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isSatisfied ? "text-brand" : "text-text-primary"}`}>
                {prereq.label}
              </p>
              {!isSatisfied && prereq.hint && (
                <p className="text-xs text-text-tertiary mt-0.5">{prereq.hint}</p>
              )}
              {isSatisfied && (
                <p className="text-xs text-brand/70 mt-0.5">Completed</p>
              )}
              {!isSatisfied && prereq.cta && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 h-7 text-xs"
                  onClick={() => dispatch(prereq.cta!.action)}
                >
                  {prereq.cta.label}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Pitfalls tab with CTA support
function PitfallsTab({ pitfalls }: { pitfalls: HandbookPitfall[] }) {
  const dispatch = useHandbookActionDispatcher();

  if (pitfalls.length === 0) {
    return <p className="text-sm text-text-secondary">No common pitfalls documented.</p>;
  }

  return (
    <div className="space-y-2">
      {pitfalls.map((p, i) => (
        <div key={i} className="p-3 rounded-lg border border-warning/30 bg-warning/5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{p.problem}</p>
              <p className="text-xs text-text-secondary mt-1">{p.fix}</p>
              {p.cta && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 h-7 text-xs"
                  onClick={() => dispatch(p.cta!.action)}
                >
                  {p.cta.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HandbookPanelContent() {
  const { spec, isLoading, error, close } = useHandbookPanel();
  const dispatch = useHandbookActionDispatcher();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="p-4 space-y-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-20 w-full" /></div>;
  }

  if (error || !spec) {
    return (
      <div className="p-6 text-center">
        <BookOpen className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
        <p className="text-text-secondary mb-3">No handbook content for this page yet</p>
        <Button variant="outline" size="sm" onClick={() => { navigate("/handbook"); close(); }}>
          Open Handbook <ExternalLink className="ml-1.5 h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border-sf-subtle">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-text-primary">{spec.title}</h2>
          <Badge variant="secondary" className="text-[10px]">{spec.route}</Badge>
        </div>
        <p className="text-sm text-text-secondary">{spec.purpose}</p>
      </div>
      
      <Tabs defaultValue="flow" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3 bg-surface-subtle">
          <TabsTrigger value="flow" className="text-xs">Flow</TabsTrigger>
          <TabsTrigger value="checklist" className="text-xs">Checklist</TabsTrigger>
          <TabsTrigger value="shortcuts" className="text-xs">Keys</TabsTrigger>
          <TabsTrigger value="pitfalls" className="text-xs">Pitfalls</TabsTrigger>
          <TabsTrigger value="glossary" className="text-xs">Glossary</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="flow" className="mt-0 space-y-3">
            {spec.flows.map((flow) => <FlowSection key={flow.id} flow={flow} />)}
          </TabsContent>

          <TabsContent value="checklist" className="mt-0 space-y-3">
            <ChecklistTab prerequisites={spec.prerequisites} />
            <Separator className="my-4" />
            <DemoGateToggle />
          </TabsContent>

          <TabsContent value="shortcuts" className="mt-0 space-y-2">
            {spec.shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle">
                <span className="text-sm text-text-secondary">{s.action}</span>
                <kbd className="px-2 py-0.5 text-xs bg-surface rounded border border-border-sf-subtle">{s.keys}</kbd>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="pitfalls" className="mt-0 space-y-2">
            <PitfallsTab pitfalls={spec.pitfalls} />
          </TabsContent>

          <TabsContent value="glossary" className="mt-0 space-y-2">
            {spec.glossary.map((g, i) => (
              <div key={i} className="p-2 rounded-lg bg-surface-subtle">
                <p className="text-sm font-medium text-brand">{g.term}</p>
                <p className="text-xs text-text-secondary">{g.meaning}</p>
              </div>
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export function HandbookSheet() {
  const { isOpen, close } = useHandbookPanel();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(o) => !o && close()}>
        <DrawerContent className="max-h-[70vh] bg-surface">
          <DrawerHeader className="sr-only"><DrawerTitle>Handbook</DrawerTitle></DrawerHeader>
          <HandbookPanelContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-[420px] p-0 bg-surface border-l border-border-sf-subtle">
        <SheetHeader className="sr-only"><SheetTitle>Handbook</SheetTitle></SheetHeader>
        <HandbookPanelContent />
      </SheetContent>
    </Sheet>
  );
}
