import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function RequireAdmin({ children }) {
  const { user, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return <div className="admin-loading">Yüklənir...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || "").toLowerCase();

  if (role !== "admin" && role !== "administrator") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequireAdmin;
