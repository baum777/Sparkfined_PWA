export type PushPermission = NotificationPermission;

export const isNotificationsSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return "Notification" in window;
};

export const getPermission = (): PushPermission => {
  if (!isNotificationsSupported()) return "default";
  return Notification.permission;
};

export const requestPermission = async (): Promise<PushPermission> => {
  if (!isNotificationsSupported()) return "default";
  return Notification.requestPermission();
};

export const sendTestNotification = (
  title = "Sparkfined alert",
  options?: NotificationOptions,
): boolean => {
  if (!isNotificationsSupported()) return false;
  if (Notification.permission !== "granted") return false;
  new Notification(title, options);
  return true;
};
