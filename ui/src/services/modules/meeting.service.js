import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class MeetingService {
  static getAll() {
    return api.get(`${ENDPOINTS.MEETINGS}/all`);
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.MEETINGS}/${id}`);
  }

  static getByClass(classId) {
    return api.get(`${ENDPOINTS.CLASSES}/${classId}/meetings`);
  }

  static create(classId, payload) {
    return api.post(`${ENDPOINTS.CLASSES}/${classId}/meetings`, payload);
  }

  static update(id, payload) {
    return api.put(`${ENDPOINTS.MEETINGS}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.MEETINGS}/${id}`);
  }
}

export default MeetingService;
