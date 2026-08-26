import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class UserActivityService {
  static getAll(params) {
    return api.get(ENDPOINTS.USER_ACTIVITIES, { params });
  }

  static getOverview(params) {
    return api.get(`${ENDPOINTS.USER_ACTIVITIES}/overview`, { params });
  }
}

export default UserActivityService;
