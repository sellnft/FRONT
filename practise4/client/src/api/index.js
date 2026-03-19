const GOODS_API_BASE = "/api/goods";
const AUTH_API_BASE = "/api/auth";
const USERS_API_BASE = "/api/users";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasSession() {
  return Boolean(getAccessToken()) || Boolean(getRefreshToken());
}

function buildHeaders(extraHeaders = {}) {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function parseOrThrow(response) {
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore json parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${AUTH_API_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = await response.json();
  if (!data?.accessToken || !data?.refreshToken) {
    clearTokens();
    return false;
  }

  setTokens(data);
  return true;
}

async function request(base, path = "", options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: buildHeaders(options.headers || {}),
  });

  if (response.status !== 401) {
    return parseOrThrow(response);
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    return parseOrThrow(response);
  }

  const retryResponse = await fetch(`${base}${path}`, {
    ...options,
    headers: buildHeaders(options.headers || {}),
  });

  return parseOrThrow(retryResponse);
}

export function getGoods() {
  return request(GOODS_API_BASE);
}

export function createGood(payload) {
  return request(GOODS_API_BASE, "", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGood(id, payload) {
  return request(GOODS_API_BASE, `/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteGood(id) {
  return request(GOODS_API_BASE, `/${id}`, {
    method: "DELETE",
  });
}

export function registerUser(payload) {
  return request(AUTH_API_BASE, "/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  const data = await request(AUTH_API_BASE, "/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (data?.accessToken && data?.refreshToken) {
    setTokens(data);
  }

  return data;
}

export function getCurrentUser() {
  return request(AUTH_API_BASE, "/me", {
    method: "POST",
  });
}

export function getUsers() {
  return request(USERS_API_BASE);
}

export function updateUserRole(id, role) {
  return request(USERS_API_BASE, `/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function updateUserBlockStatus(id, isBlocked) {
  return request(USERS_API_BASE, `/${id}/block-status`, {
    method: "PATCH",
    body: JSON.stringify({ isBlocked }),
  });
}
