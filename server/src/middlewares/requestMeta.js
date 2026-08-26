/**
 * Attaches req.meta = { ip, userAgent } so controllers can pass it straight
 * through to the logger helpers without re-reading headers every time.
 */
const requestMeta = (req, res, next) => {
  req.meta = {
    ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip,
    userAgent: req.headers["user-agent"] || null,
  };

  next();
};

module.exports = requestMeta;
