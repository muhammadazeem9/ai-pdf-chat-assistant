const asyncHandler = (fn) => {
  // Returns a middleware function to handle async route errors
  return (req, res, next) => {
    // Executes the async function and converts its result into a Promise
    Promise.resolve(fn(req, res, next)).catch(next); // Sends any error to the Express error-handling middleware
  };
};

export default asyncHandler; // Exports asyncHandler for use in routes
