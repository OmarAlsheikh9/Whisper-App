import express from 'express';
import { UserSignupSchema ,UserLoginSchema,UpdateMeSchema,ForgotPasswordSchema,ResetPasswordSchema,RefreshTokenSchema} from '../validations/userSchema.js';
import { validate } from '../middleware/validate.js';
import {signup,login,getMe,forgotPassword,resetPassword,refresh} from '../controllers/authControllers.js'
import authenticate from '../middleware/authenticate.js';
const auth = express.Router();

auth.post("/signup",validate(UserSignupSchema),signup);
auth.post("/login",validate(UserLoginSchema),login);
auth.get("/me",authenticate,getMe);

auth.post("/forgot-password",validate(ForgotPasswordSchema), forgotPassword);
auth.post("/reset-password",validate(ResetPasswordSchema), resetPassword);
auth.post("/refresh",validate(RefreshTokenSchema), refresh);

export default auth;
