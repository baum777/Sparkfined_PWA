import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { AlertQuickCreate } from "@/components/alerts/AlertQuickCreate";
import { subscribeToAction } from "@/lib/handbook/dispatchHandbookAction";
import { toast } from "@/hooks/use-toast";

type ModalType = "journal-entry" | "new-alert" | "connect-wallet" | null;
type SheetType = "chart-markets" | null;

export function GlobalActionHandler() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const navigate = useNavigate();

  // Handle open:modal/... actions
  const handleOpenModal = useCallback((target: string) => {
    switch (target) {
      case "journal-entry":
      case "new-journal":
        setActiveModal("journal-entry");
        break;
      case "new-alert":
      case "alert":
        setActiveModal("new-alert");
        break;
      case "connect-wallet":
        setActiveModal("connect-wallet");
        break;
      default:
        toast({
          title: "Modal not found",
          description: `Unknown modal: ${target}`,
        });
    }
  }, []);

  // Handle open:sheet/... actions
  const handleOpenSheet = useCallback((target: string) => {
    switch (target) {
      case "chart-markets":
        setActiveSheet("chart-markets");
        break;
      default:
        toast({
          title: "Sheet not found",
          description: `Unknown sheet: ${target}`,
        });
    }
  }, []);

  // Handle open:panel/... actions  
  const handleOpenPanel = useCallback((target: string) => {
    // Panels typically navigate to a page with a specific view
    switch (target) {
      case "journal-pending":
        navigate("/journal?view=pending");
        break;
      case "journal-logbook":
        navigate("/journal?view=logbook");
        break;
      default:
        toast({
          title: "Panel not found",
          description: `Unknown panel: ${target}`,
        });
    }
  }, [navigate]);

  // Handle do:... actions
  const handleDoAction = useCallback((target: string) => {
    switch (target) {
      case "new-journal-entry":
        setActiveModal("journal-entry");
        break;
      case "new-alert":
        setActiveModal("new-alert");
        break;
      default:
        toast({
          title: "Action not implemented",
          description: `Unknown action: ${target}`,
        });
    }
  }, []);

  // Subscribe to action events
  useEffect(() => {
    const unsubs = [
      subscribeToAction("open:modal", handleOpenModal),
      subscribeToAction("open:sheet", handleOpenSheet),
      subscribeToAction("open:panel", handleOpenPanel),
      subscribeToAction("do", handleDoAction),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, [handleOpenModal, handleOpenSheet, handleOpenPanel, handleDoAction]);

  const handleAlertCreate = useCallback((symbol: string, condition: string, targetPrice: number) => {
    toast({
      title: "Alert Created",
      description: `${symbol} ${condition} $${targetPrice}`,
    });
    setActiveModal(null);
  }, []);

  return (
    <>
      {/* Journal Entry Modal */}
      <Dialog open={activeModal === "journal-entry"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border-border-sf-subtle">
          <DialogHeader>
            <DialogTitle className="text-text-primary">New Journal Entry</DialogTitle>
          </DialogHeader>
          <JournalEntryForm onSubmit={() => setActiveModal(null)} />
        </DialogContent>
      </Dialog>

      {/* New Alert Modal */}
      <Dialog open={activeModal === "new-alert"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md bg-surface border-border-sf-subtle">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Create Alert</DialogTitle>
          </DialogHeader>
          <AlertQuickCreate onSubmit={handleAlertCreate} />
        </DialogContent>
      </Dialog>

      {/* Connect Wallet Modal - Placeholder */}
      <Dialog open={activeModal === "connect-wallet"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-sm bg-surface border-border-sf-subtle">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-text-secondary mb-4">Wallet connection coming soon</p>
            <p className="text-xs text-text-tertiary">This feature is under development</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chart Markets Sheet - Placeholder */}
      <Sheet open={activeSheet === "chart-markets"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <SheetContent side="left" className="w-64 bg-surface border-r border-border-sf-subtle">
          <SheetHeader>
            <SheetTitle className="text-text-primary">Markets</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <p className="text-text-secondary text-sm">Market list placeholder</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
