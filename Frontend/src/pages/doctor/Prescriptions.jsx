import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Search,
  RefreshCw,
  FileText,
  UserRound,
  CalendarDays,
  Pill,
  ClipboardList,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";

const styles = `
.doctor-prescriptions {
  --primary: #4169e1;
  --primary-dark: #3155c7;
  --text: #18243b;
  --muted: #8994a8;
  --border: #e8edf5;
  width: 100%;
  min-width: 0;
  padding: 8px 4px 30px;
  color: var(--text);
  font-family: Inter, "Segoe UI", sans-serif;
}
.doctor-prescriptions * { box-sizing: border-box; }
.doctor-prescriptions button,
.doctor-prescriptions input,
.doctor-prescriptions select,
.doctor-prescriptions textarea { font: inherit; }
.doctor-prescriptions button { cursor: pointer; }
.doctor-prescriptions button:disabled { cursor: not-allowed; opacity: .65; }

.rx-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 25px;
}
.rx-eyebrow {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}
.rx-heading h1 {
  margin: 0;
  color: #18243b;
  font-size: clamp(26px, 3vw, 32px);
  font-weight: 800;
  letter-spacing: -1px;
}
.rx-heading p { margin: 8px 0 0; color: var(--muted); font-size: 13px; }
.rx-actions { display: flex; align-items: center; gap: 10px; }

.rx-btn, .rx-btn-primary, .rx-btn-cancel, .rx-btn-danger {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  min-height: 42px;
  padding: 0 15px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  transition: background .2s, border-color .2s, transform .2s;
}
.rx-btn {
  border: 1px solid #e3e9f3;
  background: #fff;
  color: #42516b;
}
.rx-btn:hover { background: #f6f8ff; border-color: #cdd8f5; }
.rx-btn-primary {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
  box-shadow: 0 5px 12px #4169e126;
}
.rx-btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
.rx-btn-cancel { border: 1px solid #e1e6ef; background: #fff; color: #536078; }
.rx-btn-cancel:hover { background: #f7f8fb; }
.rx-btn-danger { border: 1px solid #dc5962; background: #dc5962; color: #fff; }
.rx-btn-danger:hover { background: #c9444e; }

.rx-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 22px;
}
.rx-stat {
  min-width: 0;
  padding: 19px 20px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 15px;
  box-shadow: 0 4px 16px #1c315007;
}
.rx-stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 13px;
  color: #758198;
  font-size: 12px;
  font-weight: 600;
}
.rx-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  border-radius: 12px;
}
.rx-blue { color: #4169e1; background: #edf1ff; }
.rx-green { color: #159467; background: #e6f8ef; }
.rx-orange { color: #d28b28; background: #fff3e1; }
.rx-stat > strong {
  display: block;
  color: #1b2942;
  font-size: 27px;
  font-weight: 800;
  line-height: 1.2;
}
.rx-stat > small { display: block; margin-top: 7px; color: #9aa4b5; font-size: 11px; }

.rx-panel {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 4px 18px #1c315007;
}
.rx-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px 21px;
  border-bottom: 1px solid #edf0f6;
}
.rx-toolbar h2 { margin: 0; color: #202d45; font-size: 15px; font-weight: 800; }
.rx-toolbar p { margin: 6px 0 0; color: #929caf; font-size: 11px; }
.rx-search {
  display: flex;
  align-items: center;
  gap: 9px;
  width: min(100%, 290px);
  min-height: 40px;
  padding: 0 12px;
  color: #8995a9;
  background: #fafbfe;
  border: 1px solid #e6ebf4;
  border-radius: 10px;
}
.rx-search:focus-within { border-color: #9aaff3; box-shadow: 0 0 0 3px #4169e10d; }
.rx-search input {
  width: 100%;
  min-width: 0;
  padding: 9px 0;
  color: #273650;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 12px;
}
.rx-search input::placeholder { color: #a0a9b8; }
.rx-search button, .rx-alert button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  color: inherit;
  background: transparent;
  border: 0;
}

.rx-table-wrap { width: 100%; overflow-x: auto; }
.rx-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
.rx-table th {
  padding: 14px 16px;
  color: #7d899e;
  background: #f8faff;
  border-bottom: 1px solid #e9edf5;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .45px;
  white-space: nowrap;
}
.rx-table td {
  padding: 15px 16px;
  color: #4d5a71;
  border-bottom: 1px solid #f0f2f7;
  vertical-align: middle;
}
.rx-table tbody tr:hover { background: #fafbff; }
.rx-table tbody tr:last-child td { border-bottom: 0; }
.rx-patient { display: flex; align-items: center; gap: 10px; min-width: 150px; }
.rx-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 37px;
  height: 37px;
  flex-shrink: 0;
  color: #4169e1;
  background: #edf1ff;
  border-radius: 11px;
}
.rx-patient strong { display: block; color: #293650; font-size: 12px; font-weight: 700; }
.rx-patient small { display: block; margin-top: 4px; color: #929caf; font-size: 10px; }
.rx-medicine { display: flex; align-items: center; gap: 9px; min-width: 145px; }
.rx-medicine-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: #16875c;
  background: #e7f8ef;
  border-radius: 10px;
}
.rx-medicine strong { color: #34435d; font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
.rx-dosage {
  display: inline-block;
  padding: 6px 9px;
  color: #5265a8;
  background: #f0f3ff;
  border-radius: 7px;
  font-size: 11px;
  white-space: nowrap;
}
.rx-instructions { display: block; max-width: 200px; color: #7d899e; line-height: 1.6; overflow-wrap: anywhere; }
.rx-date { display: inline-flex; align-items: center; gap: 7px; color: #64728a; white-space: nowrap; }
.rx-date svg { color: #8a9abd; }
.rx-id { color: #8490a5; font-size: 11px; font-weight: 700; }

.rx-row-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}
.rx-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid #e5eaf3;
  border-radius: 9px;
  background: #fff;
  transition: .2s;
}
.rx-icon-btn.edit { color: #4169e1; }
.rx-icon-btn.edit:hover { background: #edf1ff; border-color: #cbd6ff; }
.rx-icon-btn.delete { color: #dc5962; }
.rx-icon-btn.delete:hover { background: #fff0f1; border-color: #f2c7cb; }

.rx-empty {
  display: flex;
  min-height: 235px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  padding: 28px;
  color: #8a95a8;
  text-align: center;
  font-size: 12px;
}
.rx-empty strong { color: #34415a; font-size: 14px; }
.rx-empty > span { max-width: 360px; line-height: 1.7; }
.rx-empty .rx-btn-primary { margin-top: 7px; }
.rx-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
  color: #4169e1;
  background: #edf1ff;
  border-radius: 16px;
}
.rx-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 21px;
  color: #929caf;
  background: #fff;
  border-top: 1px solid #edf0f6;
  font-size: 10px;
}

.rx-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 17px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.6;
}
.rx-alert span { flex: 1; }
.rx-alert.success { color: #187a53; background: #edfaf3; border: 1px solid #d1f0df; }
.rx-alert.error { color: #b83e4a; background: #fff5f5; border: 1px solid #f2d6d8; }

.rx-spin { animation: rx-rotation .8s linear infinite; }
@keyframes rx-rotation { to { transform: rotate(360deg); } }

.rx-backdrop {
  position: fixed;
  z-index: 9999;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  background: rgb(15 25 45 / 48%);
  backdrop-filter: blur(4px);
}
.rx-modal {
  width: min(100%, 540px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e7ebf3;
  border-radius: 19px;
  box-shadow: 0 24px 80px rgb(12 27 57 / 22%);
  animation: rx-modal-in .18s ease-out;
}
.rx-delete-modal { width: min(100%, 430px); }
@keyframes rx-modal-in {
  from { opacity: 0; transform: translateY(8px) scale(.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.rx-modal-header {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 22px 23px;
  border-bottom: 1px solid #edf0f6;
}
.rx-modal-heading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  color: #4169e1;
  background: #edf1ff;
  border-radius: 13px;
}
.rx-modal-header h2 { margin: 0; color: #1d2a43; font-size: 17px; font-weight: 800; }
.rx-modal-header p { margin: 5px 0 0; color: #929caf; font-size: 11px; }
.rx-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  margin-left: auto;
  color: #78859a;
  background: #f5f7fb;
  border: 0;
  border-radius: 10px;
}
.rx-modal-close:hover { color: #34435e; background: #edf1f8; }
.rx-modal-body { display: grid; gap: 17px; padding: 22px 23px; }
.rx-field { display: grid; gap: 8px; }
.rx-field > span { color: #34435e; font-size: 12px; font-weight: 700; }
.rx-field b { color: #dc5962; }
.rx-input-wrap, .rx-select-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 45px;
  padding: 0 12px;
  color: #8b98ae;
  background: #fbfcff;
  border: 1px solid #e3e9f3;
  border-radius: 10px;
}
.rx-input-wrap:focus-within, .rx-select-wrap:focus-within {
  border-color: #9aaff3;
  box-shadow: 0 0 0 3px #4169e10d;
}
.rx-input-wrap input, .rx-select-wrap select {
  width: 100%;
  min-width: 0;
  padding: 12px 0;
  color: #293650;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 12px;
}
.rx-select-wrap select { appearance: none; }
.rx-field textarea {
  width: 100%;
  min-height: 105px;
  padding: 12px;
  resize: vertical;
  color: #293650;
  background: #fbfcff;
  border: 1px solid #e3e9f3;
  border-radius: 10px;
  outline: 0;
  font-size: 12px;
  line-height: 1.6;
}
.rx-field textarea:focus { border-color: #9aaff3; box-shadow: 0 0 0 3px #4169e10d; }
.rx-field input::placeholder, .rx-field textarea::placeholder { color: #a0a9b8; }
.rx-hint { color: #bd4851; font-size: 11px; line-height: 1.5; }
.rx-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 12px;
  color: #7180a0;
  background: #f5f7ff;
  border: 1px solid #e7ecff;
  border-radius: 10px;
  font-size: 11px;
  line-height: 1.6;
}
.rx-note svg { flex-shrink: 0; margin-top: 1px; color: #5575d6; }
.rx-modal-error { margin: 16px 23px 0; }
.rx-modal-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 23px 22px;
  border-top: 1px solid #edf0f6;
}
.rx-delete-content {
  padding: 24px;
  color: #64728a;
  font-size: 13px;
  line-height: 1.7;
}
.rx-delete-content strong { color: #293650; }

@media (max-width: 1000px) {
  .rx-stats { grid-template-columns: 1fr; gap: 10px; }
}
@media (max-width: 650px) {
  .doctor-prescriptions { padding-left: 0; padding-right: 0; }
  .rx-heading { align-items: flex-start; }
  .rx-actions { width: 100%; }
  .rx-actions button { flex: 1; }
  .rx-toolbar { padding: 15px; }
  .rx-search { width: 100%; }
  .rx-modal-header, .rx-modal-body { padding-left: 17px; padding-right: 17px; }
  .rx-modal-actions { padding-left: 17px; padding-right: 17px; }
  .rx-table th, .rx-table td { padding: 12px; }
}
`;

const getData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.$values?.items)) return data.$values.items;
  return [];
};

const getPatientId = (item) =>
  item.patientId ??
  item.PatientId ??
  item.patient?.id ??
  item.patient?.Id ??
  item.Patient?.Id;

const getDoctorId = (item) =>
  item.doctorId ??
  item.DoctorId ??
  item.doctor?.id ??
  item.doctor?.Id ??
  item.Doctor?.Id;

const getPatientName = (item) =>
  item.patient?.fullName ||
  item.patient?.FullName ||
  item.Patient?.FullName ||
  item.patientName ||
  item.PatientName ||
  "Pasiyent";

const getMedicineName = (item) =>
  item.medicationName || item.MedicationName || "Dərman göstərilməyib";

const getDosage = (item) => item.dosage || item.Dosage || "—";

const getInstructions = (item) =>
  item.instructions || item.Instructions || "Təlimat qeyd edilməyib";

const getDate = (item) =>
  item.prescriptionDate ||
  item.PrescriptionDate ||
  item.createdAt ||
  item.date ||
  item.appointmentDate ||
  item.AppointmentDate;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAppointmentStatus = (appointment) =>
  String(
    appointment.status ??
      appointment.Status ??
      appointment.appointmentStatus ??
      appointment.AppointmentStatus ??
      ""
  )
    .trim()
    .toLowerCase();

const isWaitingAppointment = (appointment) => {
  const status = getAppointmentStatus(appointment);

  return [
    "pending",
    "waiting",
    "gözləmədə",
    "gozlemede",
    "gözləyir",
    "gozleyir",
  ].includes(status);
};

const getAppointmentPatient = (appointment) => {
  const patient =
    appointment.patient ??
    appointment.Patient ??
    appointment.patientInfo ??
    appointment.PatientInfo ??
    {};

  const id =
    patient.id ??
    patient.Id ??
    appointment.patientId ??
    appointment.PatientId;

  const fullName =
    patient.fullName ??
    patient.FullName ??
    patient.name ??
    patient.Name ??
    appointment.patientName ??
    appointment.PatientName ??
    appointment.fullName ??
    appointment.FullName;

  if (id == null || !fullName) return null;

  return { id, fullName };
};

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Yeni: redaktə üçün state-lər
  const [editingId, setEditingId] = useState(null);
  const [editingDoctorId, setEditingDoctorId] = useState(null);

  // Yeni: silmə üçün state-lər
  const [deletingPrescription, setDeletingPrescription] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    medicationName: "",
    dosage: "",
    instructions: "",
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        api.get("/Prescription"),
        api.get("/Appointment"),
        api.get("/Patient"),
      ]);

      if (!active) return;

      const prescriptionResult = results[0];
      const appointmentResult = results[1];
      const patientResult = results[2];

      if (prescriptionResult.status === "fulfilled") {
        setPrescriptions(getData(prescriptionResult.value.data));
      } else {
        setPrescriptions([]);
        setError(
          prescriptionResult.reason?.response?.data?.message ||
            "Reseptləri yükləmək mümkün olmadı. Həkim hesabı ilə daxil olduğunuzu yoxlayın."
        );
      }

      const patientMap = new Map();

      if (appointmentResult.status === "fulfilled") {
        const appointments = getData(appointmentResult.value.data);

        appointments
          .filter(isWaitingAppointment)
          .forEach((appointment) => {
            const patient = getAppointmentPatient(appointment);

            if (patient) {
              patientMap.set(String(patient.id), patient);
            }
          });
      }

      if (patientResult.status === "fulfilled") {
        const patientList = getData(patientResult.value.data);

        patientList.forEach((patient) => {
          const id = patient.id ?? patient.Id;
          const fullName =
            patient.fullName ??
            patient.FullName ??
            patient.name ??
            patient.Name;

          if (id != null && fullName && !patientMap.has(String(id))) {
            patientMap.set(String(id), { id, fullName });
          }
        });
      }

      setPatients(
        Array.from(patientMap.values()).sort((a, b) =>
          a.fullName.localeCompare(b.fullName, "az")
        )
      );

      if (
        appointmentResult.status === "rejected" &&
        patientResult.status === "rejected"
      ) {
        setError(
          "Pasiyent siyahısı yüklənmədi. Appointment və Patient API icazələrini yoxlamaq lazımdır."
        );
      }

      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredPrescriptions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return prescriptions;

    return prescriptions.filter((item) =>
      [
        item.id,
        item.Id,
        getPatientId(item),
        getPatientName(item),
        getMedicineName(item),
        getDosage(item),
        getInstructions(item),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [prescriptions, search]);

  const todayCount = prescriptions.filter((item) => {
    const value = getDate(item);
    return (
      value &&
      !Number.isNaN(new Date(value).getTime()) &&
      new Date(value).toDateString() === new Date().toDateString()
    );
  }).length;

  const uniquePatients = new Set(
    prescriptions
      .map(getPatientId)
      .filter((id) => id != null)
      .map(String)
  ).size;

  // Yeni resept yaratmaq üçün mövcud funksiya
  const openModal = () => {
    setError("");
    setSuccess("");
    setEditingId(null);
    setEditingDoctorId(null);
    setForm({
      patientId: "",
      medicationName: "",
      dosage: "",
      instructions: "",
    });
    setShowModal(true);
  };

  // Yeni: mövcud resepti redaktə pəncərəsində açır
  const openEditModal = (item) => {
    const id = item.id ?? item.Id;
    const doctorId = getDoctorId(item);

    if (id == null) {
      setError("Reseptin ID-si tapılmadı. Redaktə etmək mümkün deyil.");
      return;
    }

    if (doctorId == null) {
      setError(
        "Reseptin həkim ID-si məlumatda yoxdur. Redaktədən əvvəl API məlumatını yoxlayın."
      );
      return;
    }

    setError("");
    setSuccess("");
    setEditingId(id);
    setEditingDoctorId(doctorId);

    setForm({
      patientId: String(getPatientId(item) ?? ""),
      medicationName: item.medicationName ?? item.MedicationName ?? "",
      dosage: item.dosage ?? item.Dosage ?? "",
      instructions: item.instructions ?? item.Instructions ?? "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setError("");
      setEditingId(null);
      setEditingDoctorId(null);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  // Yeni resept yaratmaq və mövcud resepti yeniləmək
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.patientId ||
      !form.medicationName.trim() ||
      !form.dosage.trim()
    ) {
      setError("Pasiyent, dərman adı və doza mütləqdir.");
      return;
    }

    if (editingId !== null && editingDoctorId == null) {
      setError("Həkim ID-si tapılmadığı üçün resept yenilənə bilmədi.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        patientId: Number(form.patientId),
        medicationName: form.medicationName.trim(),
        dosage: form.dosage.trim(),
        instructions: form.instructions.trim(),
      };

      if (editingId !== null) {
        await api.put(`/Prescription/${editingId}`, {
          id: Number(editingId),
          doctorId: Number(editingDoctorId),
          ...payload,
        });

        setSuccess("Resept uğurla yeniləndi.");
      } else {
        await api.post("/Prescription", payload);
        setSuccess("Resept uğurla yaradıldı.");
      }

      setShowModal(false);
      setEditingId(null);
      setEditingDoctorId(null);
      setForm({
        patientId: "",
        medicationName: "",
        dosage: "",
        instructions: "",
      });

      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          (editingId !== null
            ? "Resept yenilənmədi. Yalnız öz reseptinizi redaktə edə bildiyinizi və API icazələrini yoxlayın."
            : "Resept yaradılmadı. Həkim hesabının icazələrini və daxil edilən məlumatları yoxlayın.")
      );
    } finally {
      setSaving(false);
    }
  };

  // Yeni: silmək üçün təsdiq pəncərəsini açır
  const requestDelete = (item) => {
    setError("");
    setSuccess("");
    setDeleteError("");
    setDeletingPrescription(item);
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setDeletingPrescription(null);
      setDeleteError("");
    }
  };

  // Yeni: resepti backend-dən silir
  const confirmDelete = async () => {
    if (!deletingPrescription) return;

    const id = deletingPrescription.id ?? deletingPrescription.Id;

    if (id == null) {
      setDeleteError("Reseptin ID-si tapılmadı.");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await api.delete(`/Prescription/${id}`);

      setDeletingPrescription(null);
      setSuccess("Resept uğurla silindi.");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Resept silinmədi. Yalnız öz reseptlərinizi silə bildiyinizi və API icazələrini yoxlayın."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="doctor-prescriptions">
      <style>{styles}</style>

      <header className="rx-heading">
        <div>
          <span className="rx-eyebrow">HƏKİM PANELİ</span>
          <h1>Reseptlər</h1>
          <p>Pasiyentləriniz üçün reseptləri idarə edin.</p>
        </div>

        <div className="rx-actions">
          <button
            className="rx-btn"
            type="button"
            disabled={loading}
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            <RefreshCw size={16} className={loading ? "rx-spin" : ""} />
            Yenilə
          </button>

          <button
            className="rx-btn-primary"
            type="button"
            onClick={openModal}
          >
            <Plus size={18} />
            Yeni resept
          </button>
        </div>
      </header>

      {success && (
        <div className="rx-alert success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Bağla"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && !showModal && (
        <div className="rx-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Bağla"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="rx-stats">
        <article className="rx-stat">
          <div className="rx-stat-top">
            <span>Ümumi reseptlər</span>
            <div className="rx-stat-icon rx-blue">
              <FileText size={20} />
            </div>
          </div>
          <strong>{loading ? "—" : prescriptions.length}</strong>
          <small>Sizin yaratdığınız reseptlər</small>
        </article>

        <article className="rx-stat">
          <div className="rx-stat-top">
            <span>Pasiyentlər</span>
            <div className="rx-stat-icon rx-green">
              <UserRound size={20} />
            </div>
          </div>
          <strong>{loading ? "—" : uniquePatients}</strong>
          <small>Resept yazılmış pasiyentlər</small>
        </article>

        <article className="rx-stat">
          <div className="rx-stat-top">
            <span>Bu gün</span>
            <div className="rx-stat-icon rx-orange">
              <CalendarDays size={20} />
            </div>
          </div>
          <strong>{loading ? "—" : todayCount}</strong>
          <small>Bu gün yaradılan reseptlər</small>
        </article>
      </section>

      <section className="rx-panel">
        <div className="rx-toolbar">
          <div>
            <h2>Resept siyahısı</h2>
            <p>Pasiyent və dərman məlumatları üzrə axtarış edin.</p>
          </div>

          <label className="rx-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pasiyent və ya dərman axtar..."
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Axtarışı təmizlə"
              >
                <X size={15} />
              </button>
            )}
          </label>
        </div>

        {loading ? (
          <div className="rx-empty">
            <RefreshCw size={25} className="rx-spin" />
            <span>Məlumatlar yüklənir...</span>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="rx-empty">
            <div className="rx-empty-icon">
              <ClipboardList size={28} />
            </div>
            <strong>
              {search ? "Uyğun resept tapılmadı" : "Hələ resept yoxdur"}
            </strong>
            <span>
              {search
                ? "Axtarış sözünü dəyişib yenidən yoxlayın."
                : "İlk resepti yaratmaq üçün “Yeni resept” düyməsinə basın."}
            </span>
            {!search && (
              <button
                className="rx-btn-primary"
                type="button"
                onClick={openModal}
              >
                <Plus size={17} />
                Yeni resept yarat
              </button>
            )}
          </div>
        ) : (
          <div className="rx-table-wrap">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Pasiyent</th>
                  <th>Dərman</th>
                  <th>Doza</th>
                  <th>İstifadə qaydası</th>
                  <th>Tarix</th>
                  <th>ID</th>
                  <th>Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((item, index) => {
                  const patientId = getPatientId(item);
                  const prescriptionId = item.id ?? item.Id;

                  return (
                    <tr key={prescriptionId ?? index}>
                      <td>
                        <div className="rx-patient">
                          <div className="rx-avatar">
                            <UserRound size={18} />
                          </div>
                          <div>
                            <strong>{getPatientName(item)}</strong>
                            <small>Pasiyent #{patientId ?? "—"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="rx-medicine">
                          <div className="rx-medicine-icon">
                            <Pill size={17} />
                          </div>
                          <strong>{getMedicineName(item)}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="rx-dosage">{getDosage(item)}</span>
                      </td>

                      <td>
                        <span className="rx-instructions">
                          {getInstructions(item)}
                        </span>
                      </td>

                      <td>
                        <span className="rx-date">
                          <CalendarDays size={15} />
                          {formatDate(getDate(item))}
                        </span>
                      </td>

                      <td>
                        <span className="rx-id">
                          #{prescriptionId ?? "—"}
                        </span>
                      </td>

                      <td>
                        <div className="rx-row-actions">
                          <button
                            className="rx-icon-btn edit"
                            type="button"
                            title="Resepti redaktə et"
                            aria-label="Resepti redaktə et"
                            onClick={() => openEditModal(item)}
                            disabled={saving || deleting}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            className="rx-icon-btn delete"
                            type="button"
                            title="Resepti sil"
                            aria-label="Resepti sil"
                            onClick={() => requestDelete(item)}
                            disabled={saving || deleting}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="rx-footer">
          <span>
            {loading
              ? "Yüklənir..."
              : `${filteredPrescriptions.length} resept göstərilir`}
          </span>
          <span>Həkim paneli</span>
        </footer>
      </section>

      {/* Yeni resept yaratmaq və mövcud resepti redaktə etmək üçün modal */}
      {showModal && (
        <div
          className="rx-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="rx-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rx-modal-title"
          >
            <div className="rx-modal-header">
              <div className="rx-modal-heading-icon">
                <FileText size={21} />
              </div>

              <div>
                <h2 id="rx-modal-title">
                  {editingId !== null ? "Resepti redaktə et" : "Yeni resept"}
                </h2>
                <p>
                  {editingId !== null
                    ? "Resept məlumatlarını yeniləyin."
                    : "Pasiyent üçün resept məlumatlarını daxil edin."}
                </p>
              </div>

              <button
                className="rx-modal-close"
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Bağla"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="rx-alert error rx-modal-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="rx-modal-body">
                <label className="rx-field">
                  <span>
                    Pasiyent <b>*</b>
                  </span>

                  <div className="rx-select-wrap">
                    <UserRound size={17} />
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Pasiyent seçin</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.fullName} — #{patient.id}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>

                  {patients.length === 0 && (
                    <small className="rx-hint">
                      Gözləmədə olan pasiyent tapılmadı və ya API məlumatı
                      yükləyə bilmədi.
                    </small>
                  )}
                </label>

                <label className="rx-field">
                  <span>
                    Dərmanın adı <b>*</b>
                  </span>
                  <div className="rx-input-wrap">
                    <Pill size={17} />
                    <input
                      name="medicationName"
                      value={form.medicationName}
                      onChange={handleChange}
                      placeholder="Dərmanın adı"
                      maxLength={200}
                      required
                    />
                  </div>
                </label>

                <label className="rx-field">
                  <span>
                    Doza <b>*</b>
                  </span>
                  <div className="rx-input-wrap">
                    <ClipboardList size={17} />
                    <input
                      name="dosage"
                      value={form.dosage}
                      onChange={handleChange}
                      placeholder="Həkimin təyin etdiyi doza"
                      maxLength={200}
                      required
                    />
                  </div>
                </label>

                <label className="rx-field">
                  <span>İstifadə qaydası və qeydlər</span>
                  <textarea
                    name="instructions"
                    value={form.instructions}
                    onChange={handleChange}
                    placeholder="İstifadə qaydası və əlavə qeydlər..."
                    rows={4}
                    maxLength={2000}
                  />
                </label>

                <div className="rx-note">
                  <AlertCircle size={16} />
                  Dozanı və istifadə qaydasını pasiyentin vəziyyətinə uyğun
                  dəqiq qeyd edin.
                </div>
              </div>

              <div className="rx-modal-actions">
                <button
                  className="rx-btn-cancel"
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Ləğv et
                </button>

                <button
                  className="rx-btn-primary"
                  type="submit"
                  disabled={saving || patients.length === 0}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="rx-spin" />
                      Yadda saxlanılır...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingId !== null
                        ? "Dəyişiklikləri yadda saxla"
                        : "Resepti yadda saxla"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Yeni: silmə təsdiqi */}
      {deletingPrescription && (
        <div
          className="rx-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeleteModal();
          }}
        >
          <section
            className="rx-modal rx-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rx-delete-title"
          >
            <div className="rx-modal-header">
              <div
                className="rx-modal-heading-icon"
                style={{ color: "#dc5962", background: "#fff0f1" }}
              >
                <Trash2 size={21} />
              </div>

              <div>
                <h2 id="rx-delete-title">Resepti silmək istəyirsiniz?</h2>
                <p>Bu əməliyyatı geri qaytarmaq mümkün olmaya bilər.</p>
              </div>

              <button
                className="rx-modal-close"
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                aria-label="Bağla"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rx-delete-content">
              {deleteError && (
                <div className="rx-alert error">
                  <AlertCircle size={17} />
                  <span>{deleteError}</span>
                </div>
              )}

              <p>
                <strong>{getMedicineName(deletingPrescription)}</strong>{" "}
                resepti silinəcək.
              </p>

              <p>
                Pasiyent:{" "}
                <strong>{getPatientName(deletingPrescription)}</strong>
              </p>

              <p>
                Resept ID:{" "}
                <strong>
                  #{deletingPrescription.id ?? deletingPrescription.Id ?? "—"}
                </strong>
              </p>
            </div>

            <div className="rx-modal-actions">
              <button
                className="rx-btn-cancel"
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Ləğv et
              </button>

              <button
                className="rx-btn-danger"
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <RefreshCw size={16} className="rx-spin" />
                    Silinir...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Bəli, sil
                  </>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}