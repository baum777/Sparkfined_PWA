import { useState, useRef } from "react";
import { Download, Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type FeedbackState = "idle" | "success" | "error";

export function DataExportImport() {
  const [exportFeedback, setExportFeedback] = useState<FeedbackState>("idle");
  const [importFeedback, setImportFeedback] = useState<FeedbackState>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      // Gather data from localStorage
      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        data: {
          // Add relevant localStorage keys here as app grows
          settings: localStorage.getItem("settings"),
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sparkfined-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Track export for setup completeness
      localStorage.setItem("lastExportDate", new Date().toISOString());

      setExportFeedback("success");
      toast({
        title: "Export successful",
        description: "Your data has been downloaded.",
      });

      // Reset feedback after 3s
      setTimeout(() => setExportFeedback("idle"), 3000);
    } catch {
      setExportFeedback("error");
      toast({
        title: "Export failed",
        description: "Could not export your data. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => setExportFeedback("idle"), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Basic validation
        if (!parsed.version || !parsed.data) {
          throw new Error("Invalid backup format");
        }

        // Restore data (stub - expand as app grows)
        if (parsed.data.settings) {
          localStorage.setItem("settings", parsed.data.settings);
        }

        setImportFeedback("success");
        toast({
          title: "Import successful",
          description: "Your data has been restored.",
        });
        setTimeout(() => setImportFeedback("idle"), 3000);
      } catch {
        setImportFeedback("error");
        toast({
          title: "Import failed",
          description: "Invalid backup file. Please check the file format.",
          variant: "destructive",
        });
        setTimeout(() => setImportFeedback("idle"), 3000);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const getButtonIcon = (feedback: FeedbackState, DefaultIcon: typeof Download) => {
    if (feedback === "success") return <Check className="h-4 w-4 text-success" />;
    if (feedback === "error") return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <DefaultIcon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4" data-testid="settings-export-import-row">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          onClick={handleExport}
          className="gap-2"
          data-testid="settings-export-btn"
        >
          {getButtonIcon(exportFeedback, Download)}
          {exportFeedback === "success" ? "Exported!" : "Export data"}
        </Button>

        <Button
          variant="outline"
          onClick={handleImportClick}
          className="gap-2"
          data-testid="settings-import-btn"
        >
          {getButtonIcon(importFeedback, Upload)}
          {importFeedback === "success" ? "Imported!" : "Import backup"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Import backup file"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Export downloads a JSON file with your settings. Import restores from a previous backup.
      </p>
    </div>
  );
}
