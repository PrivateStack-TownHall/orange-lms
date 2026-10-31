import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class NotificationService {
  static getAll(params) {
    return api.get(ENDPOINTS.NOTIFICATIONS, { params });
  }

  static getSummary() {
    return api.get(`${ENDPOINTS.NOTIFICATIONS}/summary`);
  }

  static markAsRead(id) {
    return api.put(`${ENDPOINTS.NOTIFICATIONS}/${id}/read`);
  }

  static markAllAsRead() {
    return api.put(`${ENDPOINTS.NOTIFICATIONS}/mark-all-read`);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.NOTIFICATIONS}/${id}`);
  }
}

export default NotificationService;
