import React from 'react'
import { Button } from '@/design-system'
import { canUseNotifications, requestNotificationPermission } from '@/lib/alerts/triggerEngine'

export default function NotificationsPermissionButton() {
  const [permission, setPermission] = React.useState<NotificationPermission>(() => {
    if (canUseNotifications()) {
      return Notification.permission
    }
    return 'denied'
  })
  const [isRequesting, setIsRequesting] = React.useState(false)

  React.useEffect(() => {
    if (canUseNotifications()) {
      setPermission(Notification.permission)
    }
  }, [])

  if (!canUseNotifications() || permission === 'granted') {
    return null
  }

  const handleEnableNotifications = async () => {
    setIsRequesting(true)
    try {
      const nextPermission = await requestNotificationPermission()
      setPermission(nextPermission)
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleEnableNotifications}
      isLoading={isRequesting}
      data-testid="alerts-enable-notifications-button"
    >
      Enable browser notifications
    </Button>
  )
}
