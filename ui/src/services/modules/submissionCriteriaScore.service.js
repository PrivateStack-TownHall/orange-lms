import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class SubmissionCriteriaScoreService {
  static getByAssessment(assessmentResultId) {
    return api.get(
      `${ENDPOINTS.SUBMISSION_SCORES}/assessment/${assessmentResultId}`,
    );
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.SUBMISSION_SCORES}/${id}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.SUBMISSION_SCORES, payload);
  }

  static update(id, payload) {
    return api.put(`${ENDPOINTS.SUBMISSION_SCORES}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.SUBMISSION_SCORES}/${id}`);
  }
}

export default SubmissionCriteriaScoreService;
