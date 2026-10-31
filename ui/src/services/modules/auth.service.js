import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class AuthService {
  static async login(payload) {
    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
    return data;
  }

  static async register(payload) {
    const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
    return data;
  }

  static async me() {
    const token = this.getToken();

    const { data } = await api.get(ENDPOINTS.AUTH.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  }

  static saveSession(token, user) {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  /**
   * Notifies the backend so the logout gets recorded in AuditLog +
   * UserActivity. Best-effort: if the request fails (e.g. token already
   * expired), local session is still cleared right after via `logout()`.
   */
  static async logoutRequest() {
    try {
      await api.post(ENDPOINTS.AUTH_LOGOUT);
    } catch {
      // Ignore — local session clears regardless.
    }
  }

  static logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  }

  static getToken() {
    return localStorage.getItem("access_token");
  }

  static getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
}

export default AuthService;
