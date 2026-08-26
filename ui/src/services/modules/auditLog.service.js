import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

class AuditLogService {
  static getAll(params) {
    return api.get(ENDPOINTS.AUDIT_LOGS, { params });
  }

  static getOverview(params) {
    return api.get(`${ENDPOINTS.AUDIT_LOGS}/overview`, { params });
  }
}

export default AuditLogService;
