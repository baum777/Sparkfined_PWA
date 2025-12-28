import React from "react";
import { Plus } from "@/lib/icons";
import "./fab.css";

interface FABProps {
  onClick: () => void;
  ariaExpanded?: boolean;
}

export function FAB({ onClick, ariaExpanded }: FABProps) {
  return (
    <div className="sf-fab-container" aria-hidden={false}>
      <button
        type="button"
        className="sf-fab-button"
        aria-label="Quick actions"
        aria-expanded={ariaExpanded}
        onClick={onClick}
      >
        <Plus className="sf-fab-icon" aria-hidden="true" />
      </button>
    </div>
  );
}

export default FAB;
