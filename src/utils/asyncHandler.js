const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
      //  console.log("handler" , req.body)
    }
  }
  
  export { asyncHandler };