
/**
 * GeckoWeb API client
 *
 * A URL da API pode ser configurada por VITE_API_URL.
 *
 * Exemplo:
 * VITE_API_URL=https://geckolabsdev.duckdns.org/api
 */

export const API_BASE = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

const API_URL = API_BASE;

export function apiError(error) {
  if (!error) {
    return "Erro desconhecido.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.detail) {
    return error.detail;
  }

  if (error.message) {
    return error.message;
  }

  if (error.error) {
    return error.error;
  }

  return "Ocorreu um erro ao comunicar com a API.";
}

async function request(path, options = {}) {
  const token = localStorage.getItem("gecko_token");
  const headers = new Headers(options.headers || {});

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";

  let data;

  if (response.status === 204) {
    data = null;
  } else if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.detail || data.message || data.error || "Erro na API."
        : data || `Erro HTTP ${response.status}.`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return {
    data,
    status: response.status,
  };
}

export const api = {
  get: (path, options = {}) =>
    request(path, {
      ...options,
      method: "GET",
    }),

  post: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "PUT",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "PATCH",
      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }),

  delete: (path, options = {}) =>
    request(path, {
      ...options,
      method: "DELETE",
    }),

  request,
};

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("gecko_token", token);
  } else {
    localStorage.removeItem("gecko_token");
  }
}

export function getAuthToken() {
  return localStorage.getItem("gecko_token");
}

export function clearAuthToken() {
  localStorage.removeItem("gecko_token");
}

export default api;