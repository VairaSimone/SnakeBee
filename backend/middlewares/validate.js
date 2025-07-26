const validateBody = schema => (req, _res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }
  next();
};

export default validateBody;
