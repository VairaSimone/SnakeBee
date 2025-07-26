import { body, validationResult } from 'express-validator';

export const validateNotification = [
  body('type').isIn(['feeding', 'health', 'new_post']).withMessage('Tipo notifica non valido'),
  body('message').notEmpty().withMessage('Messaggio obbligatorio'),
  body('date').optional().isISO8601().withMessage('Data non valida'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

export const validateNotificationUpdate = [
  body('type').optional().isIn(['feeding', 'health', 'new_post']).withMessage('Tipo notifica non valido'),
  body('message').optional().notEmpty().withMessage('Messaggio obbligatorio'),
  body('read').optional().isBoolean().withMessage('Valore "read" non valido'),
  body('status').optional().isIn(['pending', 'sent']).withMessage('Status non valido'),
  body('date').optional().isISO8601().withMessage('Data non valida'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];