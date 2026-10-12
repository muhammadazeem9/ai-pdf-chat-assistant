import multer from "multer";

export default function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      err.statusCode = 413;
      err.message = "PDF cannot exceed 20 MB.";
      err.isOperational = true;
    } else {
      err.statusCode = 400;
      err.message =
        "Invalid upload request. Check the file field and upload limits.";
      err.isOperational = true;
    }
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose schema validation failures
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // Invalid MongoDB ObjectId or other cast failures
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  const response = {
    status: statusCode >= 500 ? "error" : "fail",
    message:
      statusCode >= 500 && !err.isOperational
        ? "Internal server error"
        : message,
  };

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    response.debug = {
      name: err.name,
      stack: err.stack,
    };
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(response);
}
