import axios from "axios";
import ENV from "../../config/env";

const api = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response.data;

    if (payload?.success === true && Object.hasOwn(payload, "data")) {
      response.data = payload.data;
      response.message = payload.message;
    }

    return response;
  },
  (error) => {
    const payload = error.response?.data;

    if (payload?.success === false) {
      error.message = payload.message || error.message;
    }

    return Promise.reject(error);
  },
);

export default api;
