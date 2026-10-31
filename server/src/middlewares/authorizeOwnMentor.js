const authorizeOwnMentor = (req, res, next) => {
  if (req.user.role === "Owner" || req.user.role === "Admin") {
    return next();
  }

  if (req.user.role === "Mentor" && req.user.id === Number(req.params.id)) {
    return next();
  }

  throw new Error("Forbidden");
};

module.exports = authorizeOwnMentor;
