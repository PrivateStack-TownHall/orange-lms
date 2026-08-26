import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class TaskService {
  static getAll(params) {
    return api.get(`${ENDPOINTS.TASKS}/all`, { params });
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.TASKS}/${id}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.TASKS, payload);
  }
  static createTaskByMeeting(meetingId, payload) {
    return api.post(`/meetings/${meetingId}/tasks`, payload);
  }
  static update(id, payload) {
    return api.put(`${ENDPOINTS.TASKS}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.TASKS}/${id}`);
  }

  /**
   * Submissions
   */
  static submit(taskId, payload) {
    return api.post(ENDPOINTS.TASK_SUBMIT(taskId), payload);
  }

  static getSubmissions(taskId) {
    return api.get(ENDPOINTS.TASK_SUBMISSIONS(taskId));
  }

  static getSubmissionDetail(submissionId) {
    return api.get(ENDPOINTS.SUBMISSION_DETAIL(submissionId));
  }

  static updateSubmission(submissionId, payload) {
    return api.put(ENDPOINTS.SUBMISSION_DETAIL(submissionId), payload);
  }

  static reviewSubmission(submissionId, payload) {
    return api.put(ENDPOINTS.SUBMISSION_REVIEW(submissionId), payload);
  }
}

export default TaskService;
