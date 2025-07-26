import { body, param } from 'express-validator';
import mongoose from 'mongoose';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const createBreedingRules = [
  body('male')
    .exists().withMessage('Il campo male è obbligatorio')
    .custom(isValidObjectId).withMessage('male deve essere un ObjectId valido'),
  body('female')
    .exists().withMessage('Il campo female è obbligatorio')
    .custom(isValidObjectId).withMessage('female deve essere un ObjectId valido'),
  body('ovulationDate').optional()
    .isISO8601().toDate().withMessage('ovulationDate deve essere una data valida'),
  body('clutchDate').optional()
    .isISO8601().toDate().withMessage('clutchDate deve essere una data valida'),
  body('incubationStart').optional()
    .isISO8601().toDate().withMessage('incubationStart deve essere una data valida'),
  body('incubationEnd').optional()
    .isISO8601().toDate().withMessage('incubationEnd deve essere una data valida'),
  body('incubationNotes').optional().isString(),
  body('notes').optional().isString(),
];

export const breedingIdParamRule = [
  param('breedingId')
    .custom(isValidObjectId).withMessage('breedingId deve essere un ObjectId valido')
];
