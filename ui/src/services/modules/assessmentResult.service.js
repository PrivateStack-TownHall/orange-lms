import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class AssessmentResultService {
  static getAll() {
    return api.get(ENDPOINTS.ASSESSMENT_RESULTS);
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.ASSESSMENT_RESULTS}/${id}`);
  }

  static getBySubmission(submissionId) {
    return api.get(`${ENDPOINTS.ASSESSMENT_RESULTS}/submission/${submissionId}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.ASSESSMENT_RESULTS, payload);
  }

  static update(id, payload) {
    return api.put(`${ENDPOINTS.ASSESSMENT_RESULTS}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.ASSESSMENT_RESULTS}/${id}`);
  }
}

export default AssessmentResultService;
