import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getInbox, answerQuestion, updateQuestion, deleteQuestion, likeQuestion } from "../controllers/questionController.js";
import {AnswerQuestionSchema,UpdateQuestionSchema} from "../validations/questionSchema.js"
import {validate} from "../middleware/validate.js";
const questionsRouter = express.Router();

// Public routes
questionsRouter.post("/:id/like", likeQuestion);

// Protected routes
questionsRouter.use(authenticate);
questionsRouter.get("/inbox",getInbox);
questionsRouter.post("/:id/answer",validate(AnswerQuestionSchema),answerQuestion);
questionsRouter.patch("/:id",validate(UpdateQuestionSchema),updateQuestion);
questionsRouter.delete("/:id",deleteQuestion);
export default questionsRouter;