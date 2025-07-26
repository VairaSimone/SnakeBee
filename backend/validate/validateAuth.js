import Joi from 'joi';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const passwordValidation = Joi.string()
  .pattern(passwordPattern)
  .message("La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale.")
  .required();

export const signupSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email().required(),
  password: passwordValidation,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'La conferma della password non corrisponde' }),
  avatar: Joi.string(),
  privacyConsent: Joi.boolean().valid(true).required()

});

export const signinSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: passwordValidation,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'La conferma della password non corrisponde' }),
});
export const changeEmailSchema = Joi.object({
  newEmail: Joi.string().email().required(),
  password: Joi.string().required()
});
export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
  newPassword: passwordValidation, 
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({ 'any.only': 'La conferma della password non corrisponde' }),
});
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  userType: Joi.string().valid("private", "breeder", "business"),
  farmName: Joi.string().allow(""),
  address: Joi.string().allow(""),
  city: Joi.string().allow(""),
  province: Joi.string().length(2).allow(""),
  zipCode: Joi.string().length(5).pattern(/^[0-9]+$/).allow(""),
  phone: Joi.string().allow(""),
  website: Joi.string().uri().allow(""),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  bio: Joi.string().max(1000).allow("")
});