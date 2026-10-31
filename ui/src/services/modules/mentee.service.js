import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class MenteeService {
  static getAll(params) {
    return api.get(ENDPOINTS.MENTEES, { params });
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.MENTEES}/${id}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.MENTEES, payload);
  }

  static update(id, payload) {
    return api.put(`${ENDPOINTS.MENTEES}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.MENTEES}/${id}`);
  }
}

export default MenteeService;
