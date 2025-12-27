import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const CONFIRM_TEXT = "RESET";

export function FactoryReset() {
  const [confirmValue, setConfirmValue] = useState("");
  const [open, setOpen] = useState(false);

  const isConfirmValid = confirmValue === CONFIRM_TEXT;

  const handleReset = () => {
    // Clear all localStorage data
    localStorage.clear();

    toast({
      title: "Factory reset complete",
      description: "All local data has been cleared. The page will reload.",
    });

    // Reload after short delay to show toast
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setConfirmValue("");
    }
  };

  return (
    <div className="space-y-3">
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="gap-2"
            data-testid="settings-factory-reset-btn"
          >
            <Trash2 className="h-4 w-4" />
            Factory reset
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This will permanently delete all your local data including journal entries,
                alerts, watchlist, and settings. This action cannot be undone.
              </span>
              <span className="block font-medium text-foreground">
                Type <code className="rounded bg-muted px-1.5 py-0.5 text-destructive">{CONFIRM_TEXT}</code> to confirm.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Label htmlFor="confirm-reset" className="sr-only">
              Type RESET to confirm
            </Label>
            <Input
              id="confirm-reset"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder={`Type ${CONFIRM_TEXT} to confirm`}
              className="font-mono"
              autoComplete="off"
              data-testid="settings-reset-confirm-input"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel data-testid="settings-reset-cancel-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={!isConfirmValid}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              data-testid="settings-reset-confirm-btn"
            >
              Reset everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="text-xs text-muted-foreground">
        Clears all local data. You'll start fresh. Export your data first if you want a backup.
      </p>
    </div>
  );
}
