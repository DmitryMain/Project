/**
 * STOMP / WebSocket configuration — URLs must match Spring Boot backend.
 */
export const WS_BROKER_URL = "ws://localhost:8080/ws";

export const WS_TOPICS = {
  events: "/topic/events",
  auction: (auctionId) => `/topic/auctions/${auctionId}`
};

export const WS_RECONNECT_DELAY_MS = 3000;
