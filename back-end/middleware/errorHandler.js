// // middleware/errorHandler.js
// const errorHandler = (err, req, res, next) => {
//   let error = {
//     success: false,
//     message: err.message || 'Something went wrong',
//     code: err.code || 'INTERNAL_ERROR',
//     statusCode: err.statusCode || 500,
//   };

//   // Validation errors
//   if (err.name === 'ValidationError') {
//     error.code = 'VALIDATION_ERROR';
//     error.message = Object.values(err.errors)
//       .map((val) => val.message)
//       .join(', ');
//     error.statusCode = 400;
//   }

//   // Duplicate key error
//   if (err.code === 11000) {
//     error.code = 'DUPLICATE_ERROR';
//     error.message = 'Resource already exists';
//     error.statusCode = 400;
//   }

//   // JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     error.code = 'INVALID_TOKEN';
//     error.message = 'Invalid token';
//     error.statusCode = 401;
//   }

//   if (err.name === 'TokenExpiredError') {
//     error.code = 'TOKEN_EXPIRED';
//     error.message = 'Token expired';
//     error.statusCode = 401;
//   }

//   res.status(error.statusCode).json(error);
// };

// export default errorHandler;
