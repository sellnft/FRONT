const GOODS_API_BASE = "/api/goods";
const AUTH_API_BASE = "/api/auth";

async function request(base, path = "", options = {}) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${base}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
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

export function loginUser(payload) {
  return request(AUTH_API_BASE, "/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
