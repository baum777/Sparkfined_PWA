import React from "react";
import { Bell, FileText } from "@/lib/icons";
import "./fab.css";

interface FABMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogEntry: () => void;
  onCreateAlert: () => void;
}

export function FABMenu({ isOpen, onClose, onLogEntry, onCreateAlert }: FABMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const firstItemRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (!isOpen) return;
    const id = window.requestAnimationFrame(() => {
      firstItemRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sf-fab-menu" role="menu" aria-label="Quick actions" ref={menuRef}>
      <p className="sf-fab-menu-header">Quick actions</p>
      <button
        type="button"
        ref={firstItemRef}
        role="menuitem"
        onClick={() => {
          onClose();
          onLogEntry();
        }}
        data-testid="fab-log-entry"
      >
        <FileText size={18} aria-hidden="true" />
        <span>
          Log entry
          <span className="block sf-fab-menu-subtitle">Record a trade or note</span>
        </span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          onCreateAlert();
        }}
        data-testid="fab-create-alert"
      >
        <Bell size={18} aria-hidden="true" />
        <span>
          Create alert
          <span className="block sf-fab-menu-subtitle">Set a price trigger</span>
        </span>
      </button>
    </div>
  );
}

export default FABMenu;
