import express from 'express';
import { UserSignupSchema ,UserLoginSchema,UpdateMeSchema} from '../validations/userSchema.js';
import { validate } from '../middleware/validate.js';
import {signup,login,getMe} from '../controllers/authControllers.js'
import authenticate from '../middleware/authenticate.js';
const auth = express.Router();

auth.post("/signup",validate(UserSignupSchema),signup);
auth.post("/login",validate(UserLoginSchema),login);
auth.get("/me",authenticate,getMe);

export default auth;
