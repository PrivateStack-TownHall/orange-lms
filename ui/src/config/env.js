export const ENV = {
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_ENV: import.meta.env.VITE_APP_ENV,

  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,
  API_URL: import.meta.env.VITE_API_URL,
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL,

  DEFAULT_PAGE_SIZE: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE),

  MAX_FILE_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE),

  DATE_FORMAT: import.meta.env.VITE_DATE_FORMAT,

  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === "true",

  ENABLE_HISTORY_CLASS: import.meta.env.VITE_ENABLE_HISTORY_CLASS === "true",

  ENABLE_ASSESSMENT: import.meta.env.VITE_ENABLE_ASSESSMENT === "true",

  ENABLE_LOGGER: import.meta.env.VITE_ENABLE_LOGGER === "true",
};

export default ENV;
