export type PushPermissionState = NotificationPermission | 'unsupported';

export type PushQueueStatus =
  | 'queued'
  | 'skipped'
  | 'denied'
  | 'unsupported'
  | 'error';

export interface PushQueueEntry {
  id: string;
  alertId?: string;
  title?: string;
  status: PushQueueStatus;
  reason?: string;
  endpoint?: string | null;
  createdAt: number;
}
