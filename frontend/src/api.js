const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const readApiResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  const isHtml = /<!doctype html|<html/i.test(text);
  return {
    detail: isHtml
      ? 'The backend API is not connected for this deployment.'
      : text || response.statusText || 'Request failed.'
  };
};

export const ensureOk = async (response, fallbackMessage) => {
  const data = await readApiResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || fallbackMessage || `Request failed (${response.status}).`);
  }
  return data;
};
