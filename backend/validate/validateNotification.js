import { body, validationResult } from 'express-validator';

export const validateNotification = [
  body('type').isIn(['feeding', 'health', 'new_post', 'billing']).withMessage('errors.notification_invalid'),
  body('message').notEmpty().withMessage('errors.notification_message'),
  body('date').optional().isISO8601().withMessage('errors.notification_data'),
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

export const validateNotificationUpdate = [
  body('type').optional().isIn(['feeding', 'health', 'new_post', 'billing']).withMessage('errors.notification_invalid'),
  body('message').optional().notEmpty().withMessage('errors.notification_message'),
  body('read').optional().isBoolean().withMessage('errors.notification_read'),
  body('status').optional().isIn(['pending', 'sent']).withMessage('errors.notification_status'),
  body('date').optional().isISO8601().withMessage('errors.notification_data'),
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