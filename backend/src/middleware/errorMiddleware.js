const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message || "Something went wrong",
  });
};

module.exports = {
  errorHandler,
};