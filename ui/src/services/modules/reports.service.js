import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class ReportsService {
  static getDashboard(params) {
    return api.get(`${ENDPOINTS.REPORTS}/dashboard`, { params });
  }
}

export default ReportsService;
