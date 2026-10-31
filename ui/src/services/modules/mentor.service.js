import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class MentorService {
  static getAll(params) {
    return api.get(ENDPOINTS.MENTORS, { params });
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.MENTORS}/${id}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.MENTORS, payload);
  }

  static update(id, payload) {
    return api.put(`${ENDPOINTS.MENTORS}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.MENTORS}/${id}`);
  }
}

export default MentorService;
