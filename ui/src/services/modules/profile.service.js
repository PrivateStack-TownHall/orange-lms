import api from "../api/api";

class ProfileService {
  static getByUser(id) {
    return api.get(`/users/${id}/profile`);
  }

  static update(id, payload) {
    return api.put(`/users/${id}/profile`, payload);
  }
}

export default ProfileService;
