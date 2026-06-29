import express from 'express'
import {getPublicQuestions} from '../controllers/feedController.js'
const feedRouter = express.Router();

feedRouter.get("/",getPublicQuestions);

export default feedRouter;