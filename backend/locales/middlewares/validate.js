const validateBody = schema => (req, _res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, errors: { label: 'key' } });

  if (error) {
    error.status = 400;

    error.messages = error.details.map(detail => {
      const key = detail.context.key; 
      const type = detail.type; 
      
      return req.t(`validation.${key}.${type}`);
    });

    return next(error);
  }
  next();
};

export default validateBody;
