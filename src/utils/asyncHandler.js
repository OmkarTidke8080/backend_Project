const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asyncHandler = (fn) => (req, res, next) => {
//   try {
//     await fn(req,res,next)

//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: true,
//       message: err.message,
//     });
//   }
// };

// steps of higher order function

// const asyncHandler = () => {}
// const asyncHandler = (funct) => () => {}
// const asyncHandler = (funct) => async () => {}
