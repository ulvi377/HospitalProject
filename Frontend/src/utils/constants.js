
export const ROLES = {
  ADMIN: "Admin",
  DOCTOR: "Doctor",
  PATIENT: "Patient",
};

export const APPOINTMENT_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: "Gözləyir",
  [APPOINTMENT_STATUS.CONFIRMED]: "Təsdiqlənib",
  [APPOINTMENT_STATUS.COMPLETED]: "Tamamlanıb",
  [APPOINTMENT_STATUS.CANCELLED]: "Ləğv edilib",
};

export const DAYS_OF_WEEK = [
  {
    value: 0,
    label: "Bazar",
  },
  {
    value: 1,
    label: "Bazar ertəsi",
  },
  {
    value: 2,
    label: "Çərşənbə axşamı",
  },
  {
    value: 3,
    label: "Çərşənbə",
  },
  {
    value: 4,
    label: "Cümə axşamı",
  },
  {
    value: 5,
    label: "Cümə",
  },
  {
    value: 6,
    label: "Şənbə",
  },
];

export const PAIN_LEVELS = [
  {
    value: 1,
    label: "1 - Çox yüngül",
  },
  {
    value: 2,
    label: "2 - Yüngül",
  },
  {
    value: 3,
    label: "3 - Yüngül",
  },
  {
    value: 4,
    label: "4 - Orta",
  },
  {
    value: 5,
    label: "5 - Orta",
  },
  {
    value: 6,
    label: "6 - Orta",
  },
  {
    value: 7,
    label: "7 - Güclü",
  },
  {
    value: 8,
    label: "8 - Çox güclü",
  },
  {
    value: 9,
    label: "9 - Çox güclü",
  },
  {
    value: 10,
    label: "10 - Şiddətli",
  },
];

export const API_BASE_URL =
  "http://localhost:5000/api";

export const APP_NAME = "Avropa Hospital";
