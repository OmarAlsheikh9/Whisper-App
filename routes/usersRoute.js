import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { UpdateMeSchema } from '../validations/userSchema.js';
import {sendQuestionSchema} from '../validations/questionSchema.js'
import { getProfile,updateMe,sendQuestion,getPublicQuestionsForUser } from '../controllers/usersControllers.js';
import limiter from '../middleware/rateLimit.js';

const userRouter = express.Router();

userRouter.patch("/me",authenticate,validate(UpdateMeSchema),updateMe);
userRouter.get("/:username",getProfile);
userRouter.post("/:username/questions",validate(sendQuestionSchema),limiter,sendQuestion);
userRouter.get("/:username/questions",getPublicQuestionsForUser);
export default userRouter;