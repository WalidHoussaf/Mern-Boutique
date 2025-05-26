// Handle 404 errors - Resource not found
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Custom error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);
  console.error('Error stack:', err.stack);
  
  // Sometimes the status could still be 200 even with an error, so we set it to 500 if that's the case
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log request details for debugging
  console.error(`Request path: ${req.originalUrl}`);
  console.error(`Request method: ${req.method}`);
  console.error(`Request body: ${JSON.stringify(req.body, null, 2)}`);
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    path: req.originalUrl,
    details: err.details || null
  });
};

export { notFound, errorHandler }; 