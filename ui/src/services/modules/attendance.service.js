import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class AttendanceService {
  static getAll() {
    return api.get(ENDPOINTS.ATTENDANCES);
  }

  static getByMeeting(meetingId) {
    return api.get(`${ENDPOINTS.ATTENDANCES}/meeting/${meetingId}`);
  }

  static getByUser(userId) {
    return api.get(`${ENDPOINTS.ATTENDANCES}/user/${userId}`);
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.ATTENDANCES}/${id}`);
  }

  static getSummary(meetingId) {
    return api.get(`${ENDPOINTS.ATTENDANCES}/meeting/${meetingId}/summary`);
  }

  static mark(payload) {
    return api.post(ENDPOINTS.ATTENDANCES, payload);
  }

  static update(id, payload) {
    return api.put(`${ENDPOINTS.ATTENDANCES}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.ATTENDANCES}/${id}`);
  }
}

export default AttendanceService;
