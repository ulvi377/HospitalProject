// API bəzən massivi birbaşa, bəzən { data: [...] } kimi qaytara bilər.
export const toArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const getErrorMessage = (error, fallback = "Xəta baş verdi.") => {
  const data = error?.response?.data;
  if (typeof data === "string" && data) return data;
  if (data?.message) {
    const details = Array.isArray(data.errors) ? ` (${data.errors.join(", ")})` : "";
    return data.message + details;
  }
  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }
  if (error?.response?.status === 403) return "Bu əməliyyat üçün icazəniz yoxdur.";
  if (error?.response?.status === 401) return "Sessiya bitib. Yenidən daxil olun.";
  if (error?.message === "Network Error") return "Serverə qoşulmaq mümkün olmadı.";
  return fallback;
};

// "2026-10-09T14:30:00" -> "2026-10-09T14:30" (datetime-local input üçün)
export const toInputDateTime = (value) => (value ? String(value).slice(0, 16) : "");
export const toInputDate = (value) => (value ? String(value).slice(0, 10) : "");
// "09:00:00" -> "09:00"; "09:00" -> "09:00:00" (TimeSpan üçün)
export const toInputTime = (value) => (value ? String(value).slice(0, 5) : "");
export const toTimeSpan = (value) => (value && value.length === 5 ? `${value}:00` : value);