import { useState, useCallback } from "react";
import type { AutoCapturedEntry, ArchivedEntry, EntryEnrichment } from "../types";

interface UseQuickLogReturn {
  isOpen: boolean;
  entry: AutoCapturedEntry | ArchivedEntry | null;
  isFromArchive: boolean;
  open: (entry: AutoCapturedEntry | ArchivedEntry, fromArchive?: boolean) => void;
  close: () => void;
  save: (enrichment: EntryEnrichment) => void;
  skip: () => void;
}

interface UseQuickLogOptions {
  onSave?: (id: string, enrichment: EntryEnrichment, isFromArchive: boolean) => void;
  onSkip?: () => void;
}

export function useQuickLog({ onSave, onSkip }: UseQuickLogOptions = {}): UseQuickLogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [entry, setEntry] = useState<AutoCapturedEntry | ArchivedEntry | null>(null);
  const [isFromArchive, setIsFromArchive] = useState(false);

  const open = useCallback((newEntry: AutoCapturedEntry | ArchivedEntry, fromArchive = false) => {
    setEntry(newEntry);
    setIsFromArchive(fromArchive);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing entry to allow exit animation
    setTimeout(() => {
      setEntry(null);
      setIsFromArchive(false);
    }, 150);
  }, []);

  const save = useCallback((enrichment: EntryEnrichment) => {
    if (entry && onSave) {
      onSave(entry.id, enrichment, isFromArchive);
    }
    close();
  }, [entry, isFromArchive, onSave, close]);

  const skip = useCallback(() => {
    onSkip?.();
    close();
  }, [onSkip, close]);

  return {
    isOpen,
    entry,
    isFromArchive,
    open,
    close,
    save,
    skip,
  };
}
