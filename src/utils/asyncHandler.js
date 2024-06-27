export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;

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
