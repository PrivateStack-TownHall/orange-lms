import api from "../api/api";
import ENDPOINTS from "../api/endpoints";

const CalendarService = {
  getEvents: (params) => api.get(ENDPOINTS.CALENDAR_EVENTS, { params }),
};

export default CalendarService;
