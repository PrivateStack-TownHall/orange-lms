import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class TaskCriteriaService {
  static getByTask(taskId) {
    return api.get(`${ENDPOINTS.TASK_CRITERIA}/tasks/${taskId}`);
  }

  static getSummary(taskId) {
    return api.get(`${ENDPOINTS.TASK_CRITERIA}/tasks/${taskId}/summary`);
  }

  static getById(id) {
    return api.get(`${ENDPOINTS.TASK_CRITERIA}/${id}`);
  }

  static create(payload) {
    return api.post(ENDPOINTS.TASK_CRITERIA, payload);
  }

  static update(id, payload) {
    return api.put(`${ENDPOINTS.TASK_CRITERIA}/${id}`, payload);
  }

  static delete(id) {
    return api.delete(`${ENDPOINTS.TASK_CRITERIA}/${id}`);
  }
}

export default TaskCriteriaService;
