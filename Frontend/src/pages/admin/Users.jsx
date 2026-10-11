import { useEffect, useMemo, useState } from "react";
import userService from "../../services/userService";
import "./Users.css";

const availableRoles = ["Admin", "Doctor", "Patient"];

function normalizeUsers(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getUserName(user) {
  return (
    user.fullName ||
    user.FullName ||
    user.name ||
    user.userName ||
    user.username ||
    user.email ||
    "Adsız istifadəçi"
  );
}

function getUserEmail(user) {
  return user.email || user.Email || "—";
}

function getUserRole(user) {
  const roles =
    user.roles ??
    user.Roles ??
    user.role ??
    user.Role ??
    [];

  if (Array.isArray(roles)) {
    return roles.length ? roles.join(", ") : "Təyin edilməyib";
  }

  return roles || "Təyin edilməyib";
}

function getUserId(user) {
  return user.id ?? user.Id ?? null;
}

function getErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === "string") return data;

  if (data?.errors) {
    const errors = Object.values(data.errors).flat();
    if (errors.length) return errors.join(" ");
  }

  if (data?.message) return data.message;
  if (data?.title) return data.title;

  if (error.response?.status === 403) {
    return "Bu əməliyyat üçün admin icazəsi lazımdır.";
  }

  if (error.response?.status === 401) {
    return "Sessiya bitib. Yenidən daxil ol.";
  }

  if (error.response?.status === 404) {
    return "İstifadəçi tapılmadı.";
  }

  return "Əməliyyat alınmadı. Backend bağlantısını yoxla.";
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Patient");

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await userService.getAll();
      setUsers(normalizeUsers(data));
    } catch (err) {
      console.error(
        "İstifadəçiləri yükləmə xətası:",
        err.response?.data ?? err
      );

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const name = getUserName(user).toLowerCase();
      const email = getUserEmail(user).toLowerCase();
      const role = String(getUserRole(user)).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        role.includes(query);

      const matchesRole =
        roleFilter === "All" ||
        role
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .includes(roleFilter.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  function openRoleModal(user) {
    const currentRoles =
      user.roles ??
      user.Roles ??
      user.role ??
      user.Role ??
      [];

    const roles = Array.isArray(currentRoles)
      ? currentRoles
      : [currentRoles];

    const matchingRole = availableRoles.find((role) =>
      roles.some(
        (item) => String(item).toLowerCase() === role.toLowerCase()
      )
    );

    setSelectedUser(user);
    setSelectedRole(matchingRole || "Patient");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function handleAssignRole(event) {
    event.preventDefault();

    if (!selectedUser) return;

    const email = getUserEmail(selectedUser);

    if (email === "—") {
      setError("İstifadəçinin email ünvanı tapılmadı.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await userService.assignRole(
        email,
        selectedRole
      );

      setModalOpen(false);
      setSuccess(
        response?.message ||
          `${email} istifadəçisinə ${selectedRole} rolu təyin edildi.`
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Rol təyin etmə xətası:",
        err.response?.data ?? err
      );

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function openPasswordModal(user) {
    setPasswordUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setError("");
    setSuccess("");
    setPasswordModalOpen(true);
  }

  function closePasswordModal() {
    if (saving) return;

    setPasswordModalOpen(false);
    setPasswordUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setError("");
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    if (!passwordUser) return;

    const id = getUserId(passwordUser);

    if (!id) {
      setError("İstifadəçinin ID-si tapılmadı.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Şifrə ən azı 8 simvol olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Şifrələr uyğun gəlmir. Yenidən yoxla.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await userService.changePassword(
        id,
        newPassword
      );

      setPasswordModalOpen(false);
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);

      setSuccess(
        response?.message ||
          `${getUserName(passwordUser)} istifadəçisinin şifrəsi dəyişdirildi.`
      );
    } catch (err) {
      console.error(
        "Şifrə dəyişmə xətası:",
        err.response?.data ?? err
      );

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(user) {
    const id = getUserId(user);

    if (!id) {
      setError("İstifadəçinin ID-si tapılmadı.");
      return;
    }

    const name = getUserName(user);
    const email = getUserEmail(user);

    const confirmed = window.confirm(
      `"${name}" istifadəçisini silmək istədiyinə əminsən?\n\n` +
        `Email: ${email}\n\n` +
        "Bu əməliyyat geri qaytarılmır."
    );

    if (!confirmed) return;

    setDeletingId(String(id));
    setError("");
    setSuccess("");

    try {
      const response = await userService.deleteUser(id);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (item) => String(getUserId(item)) !== String(id)
        )
      );

      setSuccess(
        response?.message ||
          `${name} istifadəçisi uğurla silindi.`
      );
    } catch (err) {
      console.error(
        "İstifadəçini silmə xətası:",
        err.response?.data ?? err
      );

      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const adminCount = users.filter((user) =>
    String(getUserRole(user))
      .toLowerCase()
      .split(",")
      .some((role) => role.trim() === "admin")
  ).length;

  const doctorCount = users.filter((user) =>
    String(getUserRole(user))
      .toLowerCase()
      .split(",")
      .some((role) => role.trim() === "doctor")
  ).length;

  return (
    <div className="users-page">
      <header className="users-header">
        <div>
          <span className="users-eyebrow">İDARƏETMƏ PANELİ</span>
          <h1>İstifadəçilər</h1>
          <p>
            İstifadəçiləri, şifrələri və sistem rollarını idarə et.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-btn"
          onClick={loadUsers}
          disabled={loading || saving || deletingId !== null}
        >
          ↻ Yenilə
        </button>
      </header>

      {error && !modalOpen && !passwordModalOpen && (
        <div className="users-alert users-alert-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="users-alert users-alert-success">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      )}

      <div className="users-stats">
        <div className="users-stat-card">
          <div className="users-stat-icon users-blue">♙</div>
          <div>
            <span>Ümumi istifadəçilər</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon users-purple">♜</div>
          <div>
            <span>Adminlər</span>
            <strong>{adminCount}</strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon users-green">✚</div>
          <div>
            <span>Həkimlər</span>
            <strong>{doctorCount}</strong>
          </div>
        </div>
      </div>

      <section className="users-panel">
        <div className="users-panel-heading">
          <div>
            <h2>İstifadəçi siyahısı</h2>
            <p>
              İstifadəçiləri axtar, rollarını və şifrələrini dəyiş,
              lazım olduqda sil.
            </p>
          </div>
        </div>

        <div className="users-toolbar">
          <div className="users-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Ad, email və ya rol üzrə axtar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button type="button" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Rola görə filtr"
          >
            <option value="All">Bütün rollar</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="users-empty">
            <div className="users-loader" />
            <p>İstifadəçilər yüklənir...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-empty">
            <div className="users-empty-icon">♙</div>
            <h3>
              {search || roleFilter !== "All"
                ? "İstifadəçi tapılmadı"
                : "İstifadəçi yoxdur"}
            </h3>
            <p>Axtarış və filtr seçimlərini yoxla.</p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>İSTİFADƏÇİ</th>
                  <th>EMAIL</th>
                  <th>ROL</th>
                  <th className="users-actions-heading">ƏMƏLİYYAT</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user, index) => {
                  const name = getUserName(user);
                  const email = getUserEmail(user);
                  const role = String(getUserRole(user));
                  const id = getUserId(user);
                  const isDeleting =
                    deletingId !== null &&
                    deletingId === String(id);

                  return (
                    <tr key={id ?? email ?? index}>
                      <td>
                        <div className="users-person">
                          <div className="users-avatar">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{name}</strong>
                            <small>ID: {id ?? "—"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="users-email">{email}</span>
                      </td>

                      <td>
                        <div className="users-role-list">
                          {role.split(",").map((item, roleIndex) => (
                            <span
                              className={`users-role-badge users-role-${item
                                .trim()
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                              key={`${item}-${roleIndex}`}
                            >
                              {item.trim()}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td>
                        <div className="users-row-actions">
                          <button
                            type="button"
                            className="users-edit-btn"
                            onClick={() => openRoleModal(user)}
                            disabled={saving || deletingId !== null}
                          >
                            Rol təyin et
                          </button>

                          <button
                            type="button"
                            className="users-password-btn"
                            onClick={() => openPasswordModal(user)}
                            disabled={saving || deletingId !== null}
                          >
                            Şifrəni dəyiş
                          </button>

                          <button
                            type="button"
                            className="users-delete-btn"
                            onClick={() => handleDeleteUser(user)}
                            disabled={
                              saving ||
                              deletingId !== null ||
                              loading
                            }
                          >
                            {isDeleting ? "Silinir..." : "Sil"}
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

        <footer className="users-panel-footer">
          Cəmi {filteredUsers.length} istifadəçi göstərilir
        </footer>
      </section>

      {modalOpen && selectedUser && (
        <div
          className="users-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setModalOpen(false);
              setError("");
            }
          }}
        >
          <section
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-modal-title"
          >
            <div className="users-modal-header">
              <div>
                <span className="users-eyebrow">
                  İSTİFADƏÇİ İDARƏETMƏSİ
                </span>
                <h2 id="users-modal-title">Rol təyin et</h2>
              </div>

              <button
                type="button"
                className="users-close-btn"
                onClick={() => {
                  setModalOpen(false);
                  setError("");
                }}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="users-alert users-alert-error">
                {error}
              </div>
            )}

            <div className="users-selected-person">
              <div className="users-avatar">
                {getUserName(selectedUser).charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{getUserName(selectedUser)}</strong>
                <span>{getUserEmail(selectedUser)}</span>
              </div>
            </div>

            <form onSubmit={handleAssignRole} className="users-form">
              <label htmlFor="users-role-select">Yeni rol</label>

              <select
                id="users-role-select"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                required
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <p className="users-warning">
                Admin rolu istifadəçiyə geniş idarəetmə səlahiyyətləri
                verə bilər. Rolu dəyişməzdən əvvəl düzgün istifadəçini
                seçdiyinə əmin ol.
              </p>

              <div className="users-modal-actions">
                <button
                  type="button"
                  className="users-cancel-btn"
                  onClick={() => {
                    setModalOpen(false);
                    setError("");
                  }}
                  disabled={saving}
                >
                  Ləğv et
                </button>

                <button
                  type="submit"
                  className="users-primary-btn"
                  disabled={saving}
                >
                  {saving ? "Yadda saxlanılır..." : "Rolu yadda saxla"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {passwordModalOpen && passwordUser && (
        <div
          className="users-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closePasswordModal();
            }
          }}
        >
          <section
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-password-title"
          >
            <div className="users-modal-header">
              <div>
                <span className="users-eyebrow">
                  TƏHLÜKƏSİZLİK
                </span>
                <h2 id="users-password-title">Şifrəni dəyiş</h2>
              </div>

              <button
                type="button"
                className="users-close-btn"
                onClick={closePasswordModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="users-alert users-alert-error">
                {error}
              </div>
            )}

            <div className="users-selected-person">
              <div className="users-avatar">
                {getUserName(passwordUser).charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{getUserName(passwordUser)}</strong>
                <span>{getUserEmail(passwordUser)}</span>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="users-form"
            >
              <label htmlFor="users-new-password">Yeni şifrə</label>
              <input
                id="users-new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Yeni şifrəni daxil et"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <label htmlFor="users-confirm-password">
                Yeni şifrəni təkrar daxil et
              </label>
              <input
                id="users-confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Şifrəni yenidən daxil et"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <label className="users-show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) =>
                    setShowPassword(event.target.checked)
                  }
                />
                Şifrələri göstər
              </label>

              <p className="users-warning">
                Şifrə backend-in Identity təhlükəsizlik qaydalarına
                uyğun olmalıdır. Mövcud şifrə göstərilmir; yeni şifrə
                təyin edilir.
              </p>

              <div className="users-modal-actions">
                <button
                  type="button"
                  className="users-cancel-btn"
                  onClick={closePasswordModal}
                  disabled={saving}
                >
                  Ləğv et
                </button>

                <button
                  type="submit"
                  className="users-primary-btn"
                  disabled={saving}
                >
                  {saving ? "Dəyişdirilir..." : "Şifrəni yadda saxla"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}