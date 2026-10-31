import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class MaterialService {
  static getAll(params) {
    return api.get(`${ENDPOINTS.MATERIALS}/all`, { params });
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.MATERIALS}/${id}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.MATERIALS, payload);
  }
  static createMaterialByMeeting(meetingId, payload) {
    return api.post(`/meetings/${meetingId}/materials`, payload);
  }
  static update(id, payload) {
    return api.put(`${ENDPOINTS.MATERIALS}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.MATERIALS}/${id}`);
  }
}

export default MaterialService;
