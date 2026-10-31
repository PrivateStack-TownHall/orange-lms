import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class NoteService {
  static getAll(params) {
    return api.get(`${ENDPOINTS.NOTES}/all`, { params });
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.NOTES}/${id}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.NOTES, payload);
  }
  static createNoteByMeeting(meetingId, payload) {
    return api.post(`/meetings/${meetingId}/notes`, payload);
  }
  static update(id, payload) {
    return api.put(`${ENDPOINTS.NOTES}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.NOTES}/${id}`);
  }
}

export default NoteService;
