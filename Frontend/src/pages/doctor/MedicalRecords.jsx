
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  FileText,
  UserRound,
  Stethoscope,
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import api from "../../services/api";

const getArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const val = (obj, lower, upper) =>
  obj?.[lower] ?? obj?.[upper] ?? null;

const getId = (obj) => val(obj, "id", "Id");

const getName = (obj) =>
  val(obj, "fullName", "FullName") ||
  val(obj, "name", "Name") ||
  "Ad qeyd edilməyib";

const getDate = (value) => {
  if (!value) return "Tarix yoxdur";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Tarix yoxdur";

  return date.toLocaleDateString("az-AZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const emptyForm = {
  patientId: "",
  doctorId: "",
  diagnosis: "",
  symptoms: "",
  notes: "",
};

const styles = `
.medical-records-page {
  width: 100%;
  min-width: 0;
  padding: 26px;
  color: #172b4d;
  font-family: Inter, Arial, sans-serif;
  box-sizing: border-box;
}
.medical-records-page * { box-sizing: border-box; }

.medical-records-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}
.medical-records-eyebrow {
  display: block;
  margin-bottom: 8px;
  color: #3976d9;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}
.medical-records-header h1 {
  margin: 0;
  color: #172b4d;
  font-size: 28px;
  font-weight: 750;
}
.medical-records-header p {
  margin: 9px 0 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.6;
}
.mr-primary-button, .mr-secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 42px;
  padding: 11px 16px;
  border: 0;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s ease;
}
.mr-primary-button { background: #2864d7; color: #fff; }
.mr-primary-button:hover { background: #1e50b3; }
.mr-primary-button:disabled, .mr-secondary-button:disabled {
  opacity: .55; cursor: not-allowed;
}
.mr-secondary-button { background: #f1f4f9; color: #40516a; }
.mr-secondary-button:hover { background: #e5eaf2; }

.mr-alert {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 18px;
  padding: 13px 15px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 13px;
}
.mr-alert span { flex: 1; }
.mr-alert button {
  display: flex;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.mr-alert-error, .mr-inline-error {
  border-color: #fecaca;
  background: #fff1f2;
  color: #b42335;
}
.mr-alert-success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #187342;
}

.mr-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
  margin-bottom: 24px;
}
.mr-stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
  padding: 20px;
  border: 1px solid #e8edf5;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(24 48 89 / 3%);
}
.mr-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 47px;
  height: 47px;
  flex-shrink: 0;
  border-radius: 12px;
}
.mr-blue { background: #eaf1ff; color: #2864d7; }
.mr-green { background: #e5f8ee; color: #15945c; }
.mr-purple { background: #f1eaff; color: #8251d3; }
.mr-stat-card span {
  display: block;
  margin-bottom: 6px;
  color: #75849a;
  font-size: 12px;
}
.mr-stat-card strong {
  color: #172b4d;
  font-size: 25px;
  font-weight: 750;
}

.mr-content-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e8edf5;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(24 48 89 / 3%);
}
.mr-content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 22px 23px 18px;
}
.mr-content-header h2 {
  margin: 0;
  color: #172b4d;
  font-size: 18px;
  font-weight: 750;
}
.mr-content-header p {
  margin: 7px 0 0;
  color: #8591a4;
  font-size: 12px;
  line-height: 1.5;
}
.mr-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  border: 1px solid #e4eaf2;
  border-radius: 9px;
  background: #fff;
  color: #52647d;
  cursor: pointer;
  transition: .2s;
}
.mr-icon-button:hover { background: #f4f7fb; color: #2864d7; }

.mr-search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 23px 19px;
  padding: 0 13px;
  border: 1px solid #e1e7f0;
  border-radius: 9px;
  background: #fbfcfe;
  color: #8997aa;
}
.mr-search:focus-within {
  border-color: #8aaff6;
  box-shadow: 0 0 0 3px rgb(40 100 215 / 8%);
}
.mr-search input {
  width: 100%;
  height: 44px;
  border: 0;
  outline: none;
  background: transparent;
  color: #263952;
  font: inherit;
  font-size: 13px;
}
.mr-search input::placeholder { color: #9aa6b7; }
.mr-search button {
  display: flex;
  border: 0;
  background: transparent;
  color: #718096;
  cursor: pointer;
}

.mr-table-wrapper { width: 100%; overflow-x: auto; }
.mr-table { width: 100%; border-collapse: collapse; text-align: left; }
.mr-table thead { background: #f7f9fc; }
.mr-table th {
  padding: 14px 17px;
  border-top: 1px solid #edf0f6;
  border-bottom: 1px solid #e9eef5;
  color: #77869b;
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
}
.mr-table td {
  padding: 16px 17px;
  border-bottom: 1px solid #edf1f6;
  color: #53647b;
  font-size: 12px;
  vertical-align: middle;
}
.mr-table tbody tr:last-child td { border-bottom: 0; }
.mr-table tbody tr:hover { background: #fbfcff; }

.mr-patient-cell {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 175px;
}
.mr-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #eaf1ff;
  color: #2864d7;
}
.mr-patient-cell strong {
  display: block;
  margin-bottom: 5px;
  color: #243953;
  font-size: 12px;
  font-weight: 750;
}
.mr-patient-cell span { color: #91a0b3; font-size: 10px; }
.mr-doctor-cell, .mr-date-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}
.mr-doctor-cell svg, .mr-date-cell svg {
  color: #8191a7;
  flex-shrink: 0;
}
.mr-diagnosis {
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  color: #344761;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mr-actions { display: flex; align-items: center; gap: 7px; }
.mr-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: .2s;
}
.mr-view { background: #edf4ff; color: #2864d7; }
.mr-view:hover { background: #dce9ff; }
.mr-edit { background: #fff7e8; color: #b7791f; }
.mr-edit:hover { background: #ffedc9; }
.mr-delete { background: #fff0f0; color: #d14343; }
.mr-delete:hover { background: #ffe0e0; }

.mr-table-footer {
  padding: 14px 23px;
  border-top: 1px solid #edf1f6;
  color: #7e8ba0;
  font-size: 12px;
}
.mr-table-footer strong { color: #263952; }

.mr-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 270px;
  padding: 35px 20px;
  color: #8795a9;
  text-align: center;
}
.mr-state h3 {
  margin: 15px 0 7px;
  color: #2b3d56;
  font-size: 17px;
}
.mr-state p {
  max-width: 400px;
  margin: 7px 0 18px;
  color: #8492a6;
  font-size: 13px;
  line-height: 1.7;
}
.mr-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66px;
  height: 66px;
  border-radius: 18px;
  background: #f0f4fb;
  color: #8a9ab0;
}
.mr-spin { animation: mr-rotate 1.1s linear infinite; }
@keyframes mr-rotate { to { transform: rotate(360deg); } }

.mr-modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  background: rgb(15 29 51 / 48%);
  backdrop-filter: blur(3px);
}
.mr-modal {
  width: 100%;
  max-width: 570px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border: 1px solid #e7ecf4;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 24px 75px rgb(0 0 0 / 18%);
}
.mr-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 23px 25px;
  border-bottom: 1px solid #edf1f6;
}
.mr-modal-header h2 {
  margin: 0;
  color: #1d304b;
  font-size: 20px;
  font-weight: 750;
}
.mr-modal-header p {
  margin: 7px 0 0;
  color: #8390a3;
  font-size: 12px;
  line-height: 1.5;
}
.mr-modal form { padding: 22px 25px 25px; }
.mr-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 17px;
}
.mr-form-group label {
  color: #344761;
  font-size: 12px;
  font-weight: 750;
}
.mr-form-group input, .mr-form-group select, .mr-form-group textarea {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #dfe6ef;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #283b54;
  font-family: inherit;
  font-size: 13px;
  transition: .2s;
}
.mr-form-group input, .mr-form-group select { min-height: 43px; }
.mr-form-group textarea { resize: vertical; line-height: 1.6; }
.mr-form-group input:focus, .mr-form-group select:focus,
.mr-form-group textarea:focus {
  border-color: #7ca5f1;
  box-shadow: 0 0 0 3px rgb(40 100 215 / 8%);
}
.mr-form-group small { color: #d14343; font-size: 11px; }
.mr-inline-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 11px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
}
.mr-inline-error svg { flex-shrink: 0; }
.mr-modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 23px;
  padding-top: 18px;
  border-top: 1px solid #edf1f6;
}
.mr-details-modal { max-width: 540px; }
.mr-detail-list { display: flex; flex-direction: column; padding: 8px 25px; }
.mr-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid #edf1f6;
}
.mr-detail-item > span { color: #8491a4; font-size: 12px; }
.mr-detail-item > strong {
  color: #293d57;
  font-size: 12px;
  text-align: right;
  overflow-wrap: anywhere;
}
.mr-detail-block { display: block; }
.mr-detail-block > span {
  display: block;
  margin-bottom: 9px;
  font-weight: 700;
}
.mr-detail-block p {
  margin: 0;
  color: #52647c;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.mr-details-modal > .mr-modal-actions { margin: 0 25px 22px; }

@media (max-width: 1000px) {
  .medical-records-page { padding: 20px; }
  .mr-stats { gap: 12px; }
  .mr-stat-card { padding: 16px; }
  .mr-table th, .mr-table td { padding: 14px; }
}
@media (max-width: 700px) {
  .medical-records-page { padding: 14px; }
  .medical-records-header { align-items: flex-start; flex-direction: column; }
  .medical-records-header h1 { font-size: 24px; }
  .mr-stats { grid-template-columns: 1fr; }
  .mr-stat-card { padding: 16px; }
  .mr-content-header { padding: 18px 16px; }
  .mr-search { margin: 0 16px 16px; }
  .mr-modal-overlay { align-items: flex-start; padding: 12px; }
  .mr-modal { max-height: calc(100vh - 24px); }
  .mr-modal-header, .mr-modal form {
    padding-right: 17px; padding-left: 17px;
  }
  .mr-detail-list { padding-right: 17px; padding-left: 17px; }
  .mr-details-modal > .mr-modal-actions {
    margin-right: 17px; margin-left: 17px;
  }
  .mr-modal-actions { flex-wrap: wrap; }
}
`;

export default function MedicalRecords() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [patientResponse, recordResponse, doctorResponse] =
        await Promise.all([
          api.get("/Patient"),
          api.get("/MedicalRecord"),
          api.get("/Doctor").catch(() => ({ data: [] })),
        ]);

      const patientList = getArray(patientResponse.data).filter(
        (patient) =>
          getId(patient) !== null &&
          getId(patient) !== undefined &&
          Boolean(getName(patient))
      );

      const allRecords = getArray(recordResponse.data);
      const doctorList = getArray(doctorResponse.data);

      const patientIds = new Set(
        patientList.map((patient) => String(getId(patient)))
      );

      const validRecords = allRecords.filter((record) => {
        const patientId = val(record, "patientId", "PatientId");
        return (
          patientId !== null &&
          patientId !== undefined &&
          patientIds.has(String(patientId))
        );
      });

      setPatients(patientList);
      setDoctors(doctorList);
      setRecords(validRecords);
    } catch (err) {
      console.error("Medical Records xətası:", err);
      setError(
        err.response?.data?.message ||
          "Məlumatları yükləmək mümkün olmadı. Backend və giriş icazələrini yoxla."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const getPatientName = (record) => {
    const nested = val(record, "patient", "Patient");
    if (nested) return getName(nested);

    const id = val(record, "patientId", "PatientId");
    const patient = patients.find(
      (item) => String(getId(item)) === String(id)
    );

    return patient ? getName(patient) : "Pasiyent tapılmadı";
  };

  const getDoctorName = (record) => {
    const nested = val(record, "doctor", "Doctor");
    if (nested) return getName(nested);

    const id = val(record, "doctorId", "DoctorId");
    const doctor = doctors.find(
      (item) => String(getId(item)) === String(id)
    );

    return doctor ? getName(doctor) : "Həkim qeyd edilməyib";
  };

  const filteredRecords = records.filter((record) => {
    const text = [
      getPatientName(record),
      getDoctorName(record),
      val(record, "diagnosis", "Diagnosis"),
      val(record, "symptoms", "Symptoms"),
      val(record, "notes", "Notes"),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("az");

    return text.includes(search.toLocaleLowerCase("az"));
  });

  const openCreateModal = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setForm({
      patientId: String(val(record, "patientId", "PatientId") ?? ""),
      doctorId: String(val(record, "doctorId", "DoctorId") ?? ""),
      diagnosis: val(record, "diagnosis", "Diagnosis") ?? "",
      symptoms: val(record, "symptoms", "Symptoms") ?? "",
      notes: val(record, "notes", "Notes") ?? "",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingRecord(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.patientId) {
      setError("Zəhmət olmasa pasiyent seç.");
      return;
    }

    if (!form.diagnosis.trim()) {
      setError("Diaqnoz sahəsi boş ola bilməz.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        patientId: Number(form.patientId),
        doctorId: form.doctorId ? Number(form.doctorId) : null,
        diagnosis: form.diagnosis.trim(),
        symptoms: form.symptoms.trim(),
        notes: form.notes.trim(),
      };

      if (editingRecord) {
        const id = getId(editingRecord);

        await api.put(`/MedicalRecord/${id}`, {
          id,
          ...payload,
        });

        setSuccess("Müayinə qeydi yeniləndi.");
      } else {
        await api.post("/MedicalRecord", payload);
        setSuccess("Yeni müayinə qeydi yaradıldı.");
      }

      setModalOpen(false);
      setEditingRecord(null);
      setForm(emptyForm);
      await loadRecords();
    } catch (err) {
      console.error("Müayinə yadda saxlanmadı:", err);
      setError(
        err.response?.data?.message ||
          "Əməliyyat uğursuz oldu. Giriş icazələrini yoxla."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Bu müayinə qeydini silmək istəyirsən?")) return;

    try {
      setError("");
      setSuccess("");
      await api.delete(`/MedicalRecord/${getId(record)}`);

      setSuccess("Müayinə qeydi silindi.");

      if (
        detailsRecord &&
        String(getId(detailsRecord)) === String(getId(record))
      ) {
        setDetailsRecord(null);
      }

      await loadRecords();
    } catch (err) {
      console.error("Silmə xətası:", err);
      setError(
        err.response?.data?.message ||
          "Qeydi silmək mümkün olmadı. Bu əməliyyat üçün Admin icazəsi lazımdır."
      );
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="medical-records-page">
        <div className="medical-records-header">
          <div>
            <span className="medical-records-eyebrow">
              TİBBİ İDARƏETMƏ
            </span>
            <h1>Müayinə tarixçəsi</h1>
            <p>
              Pasiyentlərin müayinə qeydlərini, diaqnozlarını və
              həkim məlumatlarını idarə et.
            </p>
          </div>

          <button
            className="mr-primary-button"
            onClick={openCreateModal}
            type="button"
          >
            <Plus size={18} />
            Yeni müayinə
          </button>
        </div>

        {error && (
          <div className="mr-alert mr-alert-error">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mr-alert mr-alert-success">
            <ClipboardList size={19} />
            <span>{success}</span>
            <button type="button" onClick={() => setSuccess("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <div className="mr-stats">
          <div className="mr-stat-card">
            <div className="mr-stat-icon mr-blue">
              <FileText size={22} />
            </div>
            <div>
              <span>Ümumi müayinələr</span>
              <strong>{records.length}</strong>
            </div>
          </div>

          <div className="mr-stat-card">
            <div className="mr-stat-icon mr-green">
              <UserRound size={22} />
            </div>
            <div>
              <span>Pasiyentlər</span>
              <strong>{patients.length}</strong>
            </div>
          </div>

          <div className="mr-stat-card">
            <div className="mr-stat-icon mr-purple">
              <Stethoscope size={22} />
            </div>
            <div>
              <span>Həkimlər</span>
              <strong>{doctors.length}</strong>
            </div>
          </div>
        </div>

        <div className="mr-content-card">
          <div className="mr-content-header">
            <div>
              <h2>Müayinə qeydləri</h2>
              <p>
                Yalnız mövcud pasiyentlərə aid qeydlər göstərilir.
              </p>
            </div>

            <button
              className="mr-icon-button"
              type="button"
              onClick={loadRecords}
              title="Yenilə"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="mr-search">
            <Search size={19} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pasiyent, həkim və ya diaqnoz axtar..."
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Axtarışı təmizlə"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="mr-state">
              <RefreshCw className="mr-spin" size={30} />
              <p>Müayinə qeydləri yüklənir...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="mr-state">
              <div className="mr-empty-icon">
                <FileText size={32} />
              </div>
              <h3>
                {search
                  ? "Axtarış nəticəsi tapılmadı"
                  : "Müayinə qeydi yoxdur"}
              </h3>
              <p>
                {search
                  ? "Başqa ad və ya diaqnozla axtar."
                  : "Pasiyentə aid müayinə qeydləri yaradıldıqda burada görünəcək."}
              </p>
              {!search && (
                <button
                  className="mr-primary-button"
                  type="button"
                  onClick={openCreateModal}
                >
                  <Plus size={18} />
                  Müayinə yarat
                </button>
              )}
            </div>
          ) : (
            <div className="mr-table-wrapper">
              <table className="mr-table">
                <thead>
                  <tr>
                    <th>Pasiyent</th>
                    <th>Həkim</th>
                    <th>Diaqnoz</th>
                    <th>Müayinə tarixi</th>
                    <th>Əməliyyatlar</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={getId(record)}>
                      <td>
                        <div className="mr-patient-cell">
                          <div className="mr-avatar">
                            <UserRound size={19} />
                          </div>
                          <div>
                            <strong>{getPatientName(record)}</strong>
                            <span>
                              ID: {val(record, "patientId", "PatientId")}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="mr-doctor-cell">
                          <Stethoscope size={17} />
                          <span>{getDoctorName(record)}</span>
                        </div>
                      </td>

                      <td>
                        <span className="mr-diagnosis">
                          {val(record, "diagnosis", "Diagnosis") ||
                            "Qeyd edilməyib"}
                        </span>
                      </td>

                      <td>
                        <div className="mr-date-cell">
                          <CalendarDays size={16} />
                          {getDate(val(record, "recordDate", "RecordDate"))}
                        </div>
                      </td>

                      <td>
                        <div className="mr-actions">
                          <button
                            type="button"
                            className="mr-action-btn mr-view"
                            title="Ətraflı bax"
                            onClick={() => setDetailsRecord(record)}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            className="mr-action-btn mr-edit"
                            title="Redaktə et"
                            onClick={() => openEditModal(record)}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            className="mr-action-btn mr-delete"
                            title="Sil"
                            onClick={() => handleDelete(record)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredRecords.length > 0 && (
            <div className="mr-table-footer">
              Göstərilir: <strong>{filteredRecords.length}</strong> qeyd
            </div>
          )}
        </div>

        {modalOpen && (
          <div className="mr-modal-overlay" onClick={closeModal}>
            <div
              className="mr-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mr-modal-header">
                <div>
                  <h2>
                    {editingRecord
                      ? "Müayinəni redaktə et"
                      : "Yeni müayinə"}
                  </h2>
                  <p>Pasiyent və müayinə məlumatlarını daxil et.</p>
                </div>
                <button
                  className="mr-icon-button"
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mr-form-group">
                  <label htmlFor="mr-patient">Pasiyent *</label>
                  <select
                    id="mr-patient"
                    name="patientId"
                    value={form.patientId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pasiyent seç</option>
                    {patients.map((patient) => (
                      <option key={getId(patient)} value={getId(patient)}>
                        {getName(patient)}
                      </option>
                    ))}
                  </select>
                  {patients.length === 0 && (
                    <small>Sistemdə pasiyent tapılmadı.</small>
                  )}
                </div>

                <div className="mr-form-group">
                  <label htmlFor="mr-doctor">Həkim</label>
                  <select
                    id="mr-doctor"
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                  >
                    <option value="">Həkim seçilməyib</option>
                    {doctors.map((doctor) => (
                      <option key={getId(doctor)} value={getId(doctor)}>
                        {getName(doctor)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mr-form-group">
                  <label htmlFor="mr-diagnosis">Diaqnoz *</label>
                  <input
                    id="mr-diagnosis"
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    placeholder="Məsələn: Qrip"
                    required
                  />
                </div>

                <div className="mr-form-group">
                  <label htmlFor="mr-symptoms">Simptomlar</label>
                  <textarea
                    id="mr-symptoms"
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    placeholder="Pasiyentin simptomları..."
                    rows={3}
                  />
                </div>

                <div className="mr-form-group">
                  <label htmlFor="mr-notes">Qeydlər</label>
                  <textarea
                    id="mr-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Əlavə qeydlər və tövsiyələr..."
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="mr-inline-error">
                    <AlertCircle size={17} />
                    {error}
                  </div>
                )}

                <div className="mr-modal-actions">
                  <button
                    className="mr-secondary-button"
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Ləğv et
                  </button>
                  <button
                    className="mr-primary-button"
                    type="submit"
                    disabled={saving || patients.length === 0}
                  >
                    {saving
                      ? "Yadda saxlanılır..."
                      : editingRecord
                      ? "Dəyişiklikləri saxla"
                      : "Müayinə yarat"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {detailsRecord && (
          <div
            className="mr-modal-overlay"
            onClick={() => setDetailsRecord(null)}
          >
            <div
              className="mr-modal mr-details-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mr-modal-header">
                <div>
                  <h2>Müayinə məlumatları</h2>
                  <p>Qeydin ətraflı məlumatları</p>
                </div>
                <button
                  className="mr-icon-button"
                  type="button"
                  onClick={() => setDetailsRecord(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mr-detail-list">
                <div className="mr-detail-item">
                  <span>Pasiyent</span>
                  <strong>{getPatientName(detailsRecord)}</strong>
                </div>
                <div className="mr-detail-item">
                  <span>Həkim</span>
                  <strong>{getDoctorName(detailsRecord)}</strong>
                </div>
                <div className="mr-detail-item">
                  <span>Müayinə tarixi</span>
                  <strong>
                    {getDate(
                      val(detailsRecord, "recordDate", "RecordDate")
                    )}
                  </strong>
                </div>
                <div className="mr-detail-item">
                  <span>Diaqnoz</span>
                  <strong>
                    {val(detailsRecord, "diagnosis", "Diagnosis") ||
                      "Qeyd edilməyib"}
                  </strong>
                </div>
                <div className="mr-detail-item mr-detail-block">
                  <span>Simptomlar</span>
                  <p>
                    {val(detailsRecord, "symptoms", "Symptoms") ||
                      "Simptom qeyd edilməyib."}
                  </p>
                </div>
                <div className="mr-detail-item mr-detail-block">
                  <span>Qeydlər</span>
                  <p>
                    {val(detailsRecord, "notes", "Notes") ||
                      "Əlavə qeyd yoxdur."}
                  </p>
                </div>
              </div>

              <div className="mr-modal-actions mr-detail-actions">
                <button
                  className="mr-secondary-button"
                  type="button"
                  onClick={() => setDetailsRecord(null)}
                >
                  Bağla
                </button>
                <button
                  className="mr-primary-button"
                  type="button"
                  onClick={() => {
                    const record = detailsRecord;
                    setDetailsRecord(null);
                    openEditModal(record);
                  }}
                >
                  <Pencil size={17} />
                  Redaktə et
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
