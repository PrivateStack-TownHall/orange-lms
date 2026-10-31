import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class UserService {
  static getAll(params) {
    return api.get(`${ENDPOINTS.USERS}`, { params });
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.USERS}/${id}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.USERS, payload);
  }

  static update(id, payload) {
    return api.put(`${ENDPOINTS.USERS}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.USERS}/${id}`);
  }
}

export default UserService;
