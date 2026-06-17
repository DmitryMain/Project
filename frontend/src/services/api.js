const API_URL = "http://localhost:8080/api";

function toQuery(params) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (s === "") return;
    sp.set(k, s);
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function requestWithCredentials(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  registerUser: (payload) =>
    requestWithCredentials("/users/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    requestWithCredentials("/users/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () =>
    fetch(`${API_URL}/users/logout`, { method: "POST", credentials: "include" }),
  getMe: () =>
    requestWithCredentials("/users/me"),
  verifyEmail: (id) => requestWithCredentials(`/users/${id}/verify-email`, { method: "POST" }),
  createListing: (payload) =>
    requestWithCredentials("/catalog/listings", { method: "POST", body: JSON.stringify(payload) }),
  loadListings: ({ q, category } = {}) =>
    request(`/catalog/listings${toQuery({ q, category })}`),
  createAuction: (payload) =>
    requestWithCredentials("/auctions", { method: "POST", body: JSON.stringify(payload) }),
  placeBid: (auctionId, payload) =>
    requestWithCredentials(`/auctions/${auctionId}/bids`, { method: "POST", body: JSON.stringify(payload) }),
  loadAuctions: () => request("/auctions"),
  loadUsers: () => request("/users"),
  approveListing: (listingId) =>
    requestWithCredentials(`/moderation/listings/${listingId}/approve`, { method: "POST" }),
  rejectListing: (listingId) =>
    requestWithCredentials(`/moderation/listings/${listingId}/reject`, { method: "POST" }),
  loadUnapprovedListings: () =>
    requestWithCredentials("/moderation/listings/pending")
};
