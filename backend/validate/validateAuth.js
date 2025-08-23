import Joi from 'joi';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const passwordValidation = Joi.string()
  .pattern(passwordPattern)
  .required();

export const signupSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email().required(),
  password: passwordValidation,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  avatar: Joi.string(),
  privacyConsent: Joi.boolean().valid(true).required(),
  language: Joi.string().valid('it', 'en').default('it')

});

export const signinSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: passwordValidation,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});
export const changeEmailSchema = Joi.object({
  newEmail: Joi.string().email().required(),
  password: Joi.string().required()
});
export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required(),
  newPassword: passwordValidation, 
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});
