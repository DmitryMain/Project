import { Client } from "@stomp/stompjs";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";
import { WS_BROKER_URL, WS_RECONNECT_DELAY_MS, WS_TOPICS } from "../services/websocket";

const MarketContext = createContext(null);

export function MarketProvider({ children }) {
  const [auctions, setAuctions] = useState([]);
  const [events, setEvents] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [auctionsError, setAuctionsError] = useState(null);
  const [stompConnected, setStompConnected] = useState(false);
  const [watchedAuctionId, setWatchedAuctionId] = useState(null);

  const clientRef = useRef(null);
  const auctionSubRef = useRef(null);

  const refreshAuctions = useCallback(async () => {
    setAuctionsError(null);
    try {
      const data = await api.loadAuctions();
      setAuctions(data);
    } catch (e) {
      console.error(e);
      setAuctionsError(e?.message ?? String(e));
    } finally {
      setAuctionsLoading(false);
    }
  }, []);

  const mergeAuction = useCallback((updated) => {
    setAuctions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }, []);

  const pushEvent = useCallback((body) => {
    setEvents((prev) => [body, ...prev].slice(0, 8));
  }, []);

  useEffect(() => {
    refreshAuctions().catch(console.error);
  }, [refreshAuctions]);

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_BROKER_URL,
      reconnectDelay: WS_RECONNECT_DELAY_MS,
      onConnect: () => {
        clientRef.current = client;
        setStompConnected(true);
        client.subscribe(WS_TOPICS.events, (msg) => {
          pushEvent(msg.body);
        });
      },
      onDisconnect: () => {
        setStompConnected(false);
      },
      onWebSocketClose: () => {
        setStompConnected(false);
      }
    });
    client.activate();
    return () => {
      auctionSubRef.current?.unsubscribe();
      auctionSubRef.current = null;
      client.deactivate();
      clientRef.current = null;
      setStompConnected(false);
    };
  }, [pushEvent]);

  useEffect(() => {
    const client = clientRef.current;
    if (!client || !stompConnected) return undefined;

    if (auctionSubRef.current) {
      auctionSubRef.current.unsubscribe();
      auctionSubRef.current = null;
    }

    if (!watchedAuctionId) return undefined;

    auctionSubRef.current = client.subscribe(WS_TOPICS.auction(watchedAuctionId), (msg) => {
      const updated = JSON.parse(msg.body);
      mergeAuction(updated);
    });

    return () => {
      if (auctionSubRef.current) {
        auctionSubRef.current.unsubscribe();
        auctionSubRef.current = null;
      }
    };
  }, [watchedAuctionId, stompConnected, mergeAuction]);

  const value = useMemo(
    () => ({
      auctions,
      auctionsLoading,
      auctionsError,
      events,
      stompConnected,
      watchedAuctionId,
      setWatchedAuctionId,
      refreshAuctions,
      mergeAuction
    }),
    [
      auctions,
      auctionsLoading,
      auctionsError,
      events,
      stompConnected,
      watchedAuctionId,
      refreshAuctions,
      mergeAuction
    ]
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error("useMarket must be used within MarketProvider");
  }
  return ctx;
}
