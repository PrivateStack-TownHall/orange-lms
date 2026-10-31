const { jwt } = require("../helpers");

const authentication = (req, res, next) => {
  try {
    const bearer = req.headers.authorization;

    if (!bearer) {
      throw new Error("Unauthorized");
    }

    const token = bearer.split(" ")[1];

    const decoded = jwt.verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
