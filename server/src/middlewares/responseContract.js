const SUCCESS_MESSAGES = {
  201: "Resource created",
  202: "Request accepted",
  204: "Request completed",
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const getSuccessPayload = (payload, statusCode) => {
  const defaultMessage = SUCCESS_MESSAGES[statusCode] || "Request successful";

  if (!isPlainObject(payload)) {
    return { message: defaultMessage, data: payload };
  }

  const hasMessage = Object.hasOwn(payload, "message");
  const hasData = Object.hasOwn(payload, "data");

  if (hasMessage && hasData) {
    return { message: payload.message, data: payload.data };
  }

  if (hasMessage && Object.keys(payload).length === 1) {
    return { message: payload.message, data: null };
  }

  return { message: defaultMessage, data: payload };
};

const getErrorPayload = (payload, statusCode) => {
  const rawMessage = isPlainObject(payload) ? payload.message : null;
  const errors = Array.isArray(rawMessage)
    ? rawMessage
    : isPlainObject(payload) && Array.isArray(payload.errors)
      ? payload.errors
      : undefined;

  return {
    success: false,
    message:
      typeof rawMessage === "string"
        ? rawMessage
        : statusCode >= 500
          ? "Internal Server Error"
          : "Request failed",
    data: null,
    ...(errors ? { errors } : {}),
  };
};

const responseContract = (req, res, next) => {
  const sendJson = res.json.bind(res);

  res.json = (payload) => {
    if (isPlainObject(payload) && typeof payload.success === "boolean") {
      return sendJson(payload);
    }

    if (res.statusCode >= 400) {
      return sendJson(getErrorPayload(payload, res.statusCode));
    }

    const { message, data } = getSuccessPayload(payload, res.statusCode);

    return sendJson({
      success: true,
      message,
      data,
    });
  };

  next();
};

module.exports = responseContract;
