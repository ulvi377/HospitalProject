
export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const getUserFromToken = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );

    return {
      id:
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || decodedPayload.sub,

      email:
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] || decodedPayload.email,

      role:
        decodedPayload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || decodedPayload.role,

      name:
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ] || decodedPayload.name,
    };
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getUserFromToken();

  return user?.role || null;
};

export const hasRole = (role) => {
  return getUserRole() === role;
};

export const hasAnyRole = (roles = []) => {
  const userRole = getUserRole();

  return roles.includes(userRole);
};

export const logout = () => {
  localStorage.removeItem("token");
};
