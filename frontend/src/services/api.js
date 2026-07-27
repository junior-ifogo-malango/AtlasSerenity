// Centralise l'URL de base du backend et les appels fetch authentifiés

export const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * Effectue une requête fetch vers le backend en incluant automatiquement
 * le token d'authentification (stocké dans localStorage) s'il est présent.
 *
 * @param {string} endpoint - Chemin relatif de l'API (ex: "/users/me")
 * @param {RequestInit} options - Options fetch standard (method, body, headers, ...)
 * @returns {Promise<any>} Les données JSON de la réponse (ou null si pas de contenu)
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    const error = new Error(errorData.message || "Erreur lors de la requête API");
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export default apiFetch;
