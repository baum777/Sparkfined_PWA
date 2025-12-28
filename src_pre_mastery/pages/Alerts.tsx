import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAlerts } from '@/features/alerts';
import {
  AlertsEmptyState,
  AlertFilters,
  AlertCard,
  AlertDeleteConfirm,
  AlertQuickCreate,
} from '@/components/alerts';

export default function Alerts() {
  const {
    filteredAlerts,
    filter,
    setFilter,
    clearFilter,
    createAlert,
    deleteAlert,
    toggleAlert,
  } = useAlerts();

  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; symbol: string } | null>(null);

  const handleDeleteClick = (id: string, symbol: string) => {
    setDeleteTarget({ id, symbol });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteAlert(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleCreate = (symbol: string, condition: string, targetPrice: number) => {
    createAlert(symbol, condition, targetPrice);
  };

  const isEmpty = filteredAlerts.length === 0 && filter === 'all';

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="page-alerts">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Alerts</h1>
        </div>
      </div>

      {isEmpty && !showQuickCreate ? (
        <AlertsEmptyState onCreateClick={() => setShowQuickCreate(true)} />
      ) : (
        <>
          {/* Quick Create Form */}
          {showQuickCreate && (
            <AlertQuickCreate onSubmit={handleCreate} />
          )}

          {/* Show create form toggle if hidden */}
          {!showQuickCreate && (
            <button
              onClick={() => setShowQuickCreate(true)}
              className="self-start text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              data-testid="btn-show-quick-create"
            >
              + Create new alert
            </button>
          )}

          {/* Filters */}
          <AlertFilters
            filter={filter}
            onFilterChange={setFilter}
            onClear={clearFilter}
            resultsCount={filteredAlerts.length}
          />

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <div 
              className="rounded-md bg-muted/30 py-8 text-center text-muted-foreground"
              data-testid="alerts-filter-empty-state"
            >
              No alerts match the current filter.
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onToggle={toggleAlert}
                  onDelete={(id) => handleDeleteClick(id, alert.symbol)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDeleteConfirm
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        alertSymbol={deleteTarget?.symbol}
      />
    </div>
  );
}
