"use client";

import { useState } from "react";

interface PushPermissionProps {
  clientId: string;
}

export function PushPermission({ clientId }: PushPermissionProps) {
  const [status, setStatus] = useState<
    "idle" | "requesting" | "granted" | "denied" | "unsupported"
  >(() => {
    if (typeof window === "undefined") return "idle";
    if (!("Notification" in window) || !("serviceWorker" in navigator))
      return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    return "idle";
  });

  const requestPermission = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    setStatus("requesting");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const sub = subscription.toJSON();
      await fetch("/api/portal/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          subscription: { endpoint: sub.endpoint, keys: sub.keys },
          userAgent: navigator.userAgent,
        }),
      });

      setStatus("granted");
    } catch {
      setStatus("denied");
    }
  };

  if (status === "unsupported" || status === "granted") return null;

  return (
    <div className="rounded-2xl border border-sage/20 bg-sage/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          🔔
        </span>
        <div>
          <p className="text-sm font-medium text-ink">Rappels quotidiens</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Activez les notifications pour ne pas oublier votre check-in du jour.
          </p>
        </div>
      </div>
      {status === "denied" ? (
        <p className="text-xs text-muted-foreground">
          Notifications désactivées dans les réglages de votre appareil.
        </p>
      ) : (
        <button
          onClick={requestPermission}
          disabled={status === "requesting"}
          className="w-full min-h-[44px] rounded-xl bg-sage text-white text-sm font-medium
                     disabled:opacity-50 transition-opacity"
        >
          {status === "requesting" ? "Activation…" : "Activer les rappels"}
        </button>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
