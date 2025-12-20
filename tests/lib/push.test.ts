import {
  getPermission,
  isNotificationsSupported,
  requestPermission,
  sendTestNotification,
} from "@/api/push";

type NotificationConstructor = {
  new (title: string, options?: NotificationOptions): unknown;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
};

describe("push api", () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, "Notification");

  const setNotification = (value?: NotificationConstructor) => {
    const target = window as Window & { Notification?: NotificationConstructor };
    if (!value) {
      delete target.Notification;
      return;
    }
    Object.defineProperty(window, "Notification", {
      value,
      configurable: true,
      writable: true,
    });
  };

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(window, "Notification", originalDescriptor);
    } else {
      const target = window as Window & { Notification?: NotificationConstructor };
      delete target.Notification;
    }
  });

  it("returns default permission when notifications are unsupported", () => {
    setNotification(undefined);

    expect(isNotificationsSupported()).toBe(false);
    expect(getPermission()).toBe("default");
  });

  it("requests permission when notifications are supported", async () => {
    const requestPermissionMock = vi.fn().mockResolvedValue("granted");

    class MockNotification {
      static permission: NotificationPermission = "default";
      static requestPermission = requestPermissionMock;

      constructor() {
        // no-op
      }
    }

    setNotification(MockNotification);

    expect(isNotificationsSupported()).toBe(true);
    await expect(requestPermission()).resolves.toBe("granted");
    expect(requestPermissionMock).toHaveBeenCalledTimes(1);
  });

  it("sends a test notification when permission is granted", () => {
    const constructorSpy = vi.fn();

    class MockNotification {
      static permission: NotificationPermission = "granted";
      static requestPermission = vi.fn();

      constructor(title: string, options?: NotificationOptions) {
        constructorSpy({ title, options });
      }
    }

    setNotification(MockNotification);

    const sent = sendTestNotification("Test Alert", { body: "Hello" });

    expect(sent).toBe(true);
    expect(constructorSpy).toHaveBeenCalledWith({ title: "Test Alert", options: { body: "Hello" } });
  });
});
