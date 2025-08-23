import { body, validationResult } from 'express-validator';

export const validateFeeding = [
  body('foodType').notEmpty().withMessage('errors.foodTypeRequired'),
  body('quantity').optional().isNumeric().withMessage('errors.quantityNumber'),
  body('date').optional().isISO8601().withMessage('errors.invalidDate'),
  body('daysUntilNextFeeding').optional().isInt({ min: 0 }).withMessage('errors.daysPositiveInt'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const translatedErrors = errors.array().map(err => ({
        ...err,
        msg: req.t(err.msg) 
      }));
      return res.status(400).json({ errors: translatedErrors });
    }
    next();
  }
];
