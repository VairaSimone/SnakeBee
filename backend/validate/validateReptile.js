import { body, param ,validationResult } from 'express-validator';

export const validateReptile = [
  body('name')
    .exists().withMessage('Il nome è obbligatorio')
    .isString().withMessage('Il nome deve essere una stringa')
    .isLength({ min: 2 }).withMessage('Lunghezza minima 2 caratteri'),
  body('species')
    .exists().withMessage('La specie è obbligatoria')
    .isString().withMessage('La specie deve essere una stringa'),
  body('gender')
    .exists().withMessage('Il sesso è obbligatorio')
    .isIn(['M','F']).withMessage('Sesso non valido (M o F)'),
  body('birthYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Anno di nascita non valido'),
  body('weight')
    .optional()
    .isFloat({ min: 0.1 }).withMessage('Peso deve essere un numero positivo'),
];

export const reptileIdParam = [
  param('id')
    .exists().withMessage('ID rettile obbligatorio')
    .isMongoId().withMessage('ID non valido'),
];
