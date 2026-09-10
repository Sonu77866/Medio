import axios from "axios";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export function apiError(e, fallback = "Something went wrong. Please try again.") {
  const detail = e?.response?.data?.detail;
  if (detail == null) return e?.message || fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return (
      detail
        .map((d) => (d && typeof d.msg === "string" ? d.msg : ""))
        .filter(Boolean)
        .join(" ") || fallback
    );
  }
  if (detail && typeof detail.msg === "string") return detail.msg;
  return fallback;
}
