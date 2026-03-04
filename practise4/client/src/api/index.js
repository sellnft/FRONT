const API_BASE = "/api/goods";

async function request(path = "", options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
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
  return request();
}

export function createGood(payload) {
  return request("", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateGood(id, payload) {
  return request(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteGood(id) {
  return request(`/${id}`, {
    method: "DELETE",
  });
}
