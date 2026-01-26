"use client"

import { useState, useEffect } from "react"

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return false

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === "granted"
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== "granted") return

    // Check if the page is currently visible
    if (document.visibilityState === "visible") {
      // Don't show notification if user is on the page
      return
    }

    const notification = new Notification(title, {
      icon: "/icon.svg",
      badge: "/icon.svg",
      ...options,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    return notification
  }

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  }
}
