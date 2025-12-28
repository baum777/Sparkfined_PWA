import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

// Global event emitter for handbook actions
type ActionListener = (target: string) => void;
const actionListeners: Record<string, Set<ActionListener>> = {};

export function subscribeToAction(actionType: string, listener: ActionListener) {
  if (!actionListeners[actionType]) {
    actionListeners[actionType] = new Set();
  }
  actionListeners[actionType].add(listener);
  return () => {
    actionListeners[actionType].delete(listener);
  };
}

function emitAction(actionType: string, target: string): boolean {
  const listeners = actionListeners[actionType];
  if (listeners && listeners.size > 0) {
    listeners.forEach((listener) => listener(target));
    return true;
  }
  return false;
}

// Hook to register action handlers
export function useHandbookActionHandler(
  actionType: string,
  handler: (target: string) => void
) {
  useEffect(() => {
    return subscribeToAction(actionType, handler);
  }, [actionType, handler]);
}

type ActionHandler = (action: string) => void;

export function useHandbookActionDispatcher(): ActionHandler {
  const navigate = useNavigate();

  return useCallback((action: string) => {
    if (!action) return;

    // Parse action type
    const [type, ...rest] = action.split(":");
    const target = rest.join(":");

    switch (type) {
      case "nav": {
        // Navigate to route
        if (target) {
          navigate(target);
        }
        break;
      }

      case "focus": {
        // Focus an element by ID
        const focusEl = document.getElementById(target);
        if (focusEl) {
          focusEl.focus();
          focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          toast({
            title: "Target not found",
            description: `Could not find element: ${target}`,
            variant: "destructive",
          });
        }
        break;
      }

      case "scroll": {
        // Scroll to anchor
        const scrollEl = document.getElementById(target) || 
                         document.querySelector(`[data-anchor="${target}"]`);
        if (scrollEl) {
          scrollEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          toast({
            title: "Target not found",
            description: `Could not find anchor: ${target}`,
            variant: "destructive",
          });
        }
        break;
      }

      case "open": {
        // Try to emit to registered handlers
        if (!emitAction("open", target)) {
          // Fallback: try specific sub-types
          const [subType, name] = target.split("/");
          if (!emitAction(`open:${subType}`, name || target)) {
            toast({
              title: "Action not available",
              description: `This feature (${target}) is not available on this page`,
            });
          }
        }
        break;
      }

      case "do": {
        // Try to emit to registered handlers
        if (!emitAction("do", target)) {
          toast({
            title: "Action not available",
            description: `This action (${target}) is not available on this page`,
          });
        }
        break;
      }

      default: {
        // Unknown action type
        toast({
          title: "Unknown action",
          description: action,
        });
      }
    }
  }, [navigate]);
}
