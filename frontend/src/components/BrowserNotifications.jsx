import { useEffect, useRef } from "react";
import { useMarket } from "../contexts/MarketContext";
import { useUserSession } from "../contexts/UserSessionContext";

export function BrowserNotifications() {
  const { events } = useMarket();
  const lastNotifiedRef = useRef({});

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!events || events.length === 0) return;
    const latest = events[0];
    let eventType, entityId;

    try {
      const parsed = typeof latest === "string" ? JSON.parse(latest) : latest;
      eventType = parsed.type;
      entityId = parsed.auctionId;
    } catch {
      return;
    }

    const key = `${eventType}-${entityId || ""}`;
    if (lastNotifiedRef.current[key]) return;
    lastNotifiedRef.current[key] = true;

    if (Notification.permission !== "granted") return;

    if (eventType === "OUTBID") {
      new Notification("Вашу ставку перебили!", {
        body: `Аукцион: ${latest.auctionTitle || "неизвестный"}. Новая ставка выше.`,
        icon: "/favicon.ico",
      });
    } else if (eventType === "AUCTION_FINISHED") {
      new Notification("Аукцион завершён!", {
        body: `Поздравляем! Вы победили на аукционе "${latest.auctionTitle || ""}".`,
        icon: "/favicon.ico",
      });
    }
  }, [events]);

  return null;
}
