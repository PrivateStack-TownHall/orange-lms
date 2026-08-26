class ErrorHandling {
  static handle(error, req, res, next) {
    console.error(error);

    /**
     * Authentication
     */
    if (error.message === "Unauthorized") {
      return res.status(401).json({
        error: true,
        message: "Unauthorized",
      });
    }

    if (error.message === "Invalid credentials") {
      return res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
    }

    if (error.message === "Forbidden") {
      return res.status(403).json({
        error: true,
        message: "Access denied",
      });
    }

    if (error.message === "Permission denied") {
      return res.status(403).json({
        error: true,
        message: "Permission denied",
      });
    }

    if (
      error.message === "Only mentee can submit task" ||
      error.message === "Only owner can delete history"
    ) {
      return res.status(403).json({
        error: true,
        message: error.message,
      });
    }

    /**
     * User Access
     */
    if (error.message === "Cannot update owner") {
      return res.status(403).json({
        error: true,
        message: "Owner account cannot be updated",
      });
    }

    if (error.message === "Cannot delete owner") {
      return res.status(403).json({
        error: true,
        message: "Owner account cannot be deleted",
      });
    }

    /**
     * Not Found
     */
    const notFoundErrors = [
      "User not found",
      "Mentor not found",
      "Mentee not found",
      "Class not found",
      "Meeting not found",
      "Task not found",
      "Note not found",
      "Material not found",
      "Notification not found",
      "Task criteria not found",
      "Submission not found",
      "Attendance not found",
      "Assessment result not found",
      "History class not found",
      "Original class not found",
      "Score not found",
      "No participants found",
    ];

    if (notFoundErrors.includes(error.message)) {
      return res.status(404).json({
        error: true,
        message: error.message,
      });
    }

    /**
     * Duplicate / Conflict
     */
    const conflictErrors = [
      "Email already registered",
      "Assessment result already exists for this submission",
      "Attendance already exists for this user",
    ];

    if (conflictErrors.includes(error.message)) {
      return res.status(409).json({
        error: true,
        message: error.message,
      });
    }

    /**
     * Business-rule validation
     */
    if (error.message === "Total criteria percentage cannot exceed 100%") {
      return res.status(400).json({
        error: true,
        message: error.message,
      });
    }

    /**
     * JWT
     */
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: true,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: true,
        message: "Token expired",
      });
    }

    /**
     * Sequelize Validation
     */
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: true,
        message: error.errors.map((err) => err.message),
      });
    }

    /**
     * Sequelize Unique
     */
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: true,
        message: error.errors.map((err) => err.message),
      });
    }

    /**
     * Sequelize FK
     */
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        error: true,
        message: "Invalid relation data",
      });
    }

    /**
     * Default
     */
    return res.status(error.status || 500).json({
      error: true,
      message: error.message || "Internal Server Error",
    });
  }
}

module.exports = ErrorHandling;
