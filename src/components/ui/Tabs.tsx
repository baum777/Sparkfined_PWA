import React, { createContext, useContext, useState } from 'react';

// ============================================================================
// TABS CONTEXT
// ============================================================================

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within <Tabs>');
  }
  return context;
}

// ============================================================================
// TABS ROOT
// ============================================================================

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const activeTab = value ?? internalValue;

  const handleSetActiveTab = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ============================================================================
// TABS LIST (Tab Headers)
// ============================================================================

type TabsListProps = {
  children: React.ReactNode;
  className?: string;
};

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={[
        'flex items-center gap-1 border-b border-border-subtle',
        className,
      ].filter(Boolean).join(' ')}
      role="tablist"
    >
      {children}
    </div>
  );
}

// ============================================================================
// TABS TRIGGER (Individual Tab Button)
// ============================================================================

type TabsTriggerProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={[
        'relative px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        isActive
          ? 'text-text-primary'
          : 'text-text-secondary hover:text-text-primary',
        disabled && 'cursor-not-allowed opacity-40',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" aria-hidden="true" />
      )}
    </button>
  );
}

// ============================================================================
// TABS CONTENT (Content Panel)
// ============================================================================

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={className}
    >
      {children}
    </div>
  );
}
