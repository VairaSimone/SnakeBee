import { body, validationResult } from 'express-validator';

export const validateFeeding = [
  body('foodType').notEmpty().withMessage('Tipo di cibo obbligatorio'),
  body('quantity').optional().isNumeric().withMessage('Quantità deve essere un numero'),
  body('date').optional().isISO8601().withMessage('Data non valida'),
  body('daysUntilNextFeeding').optional().isInt({ min: 0 }).withMessage('Giorni fino al prossimo pasto deve essere un intero positivo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];
