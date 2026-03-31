const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export function resolveAvatarUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE}${normalized}`;
}
