import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class HistoryClassService {
  static getAll() {
    return api.get(ENDPOINTS.HISTORY_CLASSES);
  }

  static getSummary() {
    return api.get(`${ENDPOINTS.HISTORY_CLASSES}/summary`);
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.HISTORY_CLASSES}/${id}`);
  }

  static archive(classId) {
    return api.post(`${ENDPOINTS.HISTORY_CLASSES}/archive/${classId}`);
  }

  static restore(id) {
    return api.put(`${ENDPOINTS.HISTORY_CLASSES}/restore/${id}`);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.HISTORY_CLASSES}/${id}`);
  }
}

export default HistoryClassService;
