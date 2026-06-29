import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Question from "../models/questionModel.js";
import mongoose from "mongoose";
import xss from "xss";

export const getInbox = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { status, page, limit } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;

  const query = { recipient: userId };
  if (status) {
    query.status = status;
  }

  const total = await Question.countDocuments(query);
  const data = await Question.find(query)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    data,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
  });
});

export const answerQuestion = catchAsync(async (req, res, next) => {
  const questionId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(new AppError("Invalid id", 400));
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError("Question not found", 404));
  }

  if (!question.recipient.equals(req.user._id)) {
    return next(new AppError("Forbidden", 403));
  }

  const { answer, visibility } = req.body;
  if (answer) {
    question.answer = xss(answer);
    question.answeredAt = new Date();
    question.status = "answered";
  }
  if (visibility) {
    question.visibility = visibility;
  }

  await question.save();
  res.status(200).json(question);
});

export const updateQuestion = catchAsync(async (req, res, next) => {
  const questionId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(new AppError("Invalid id", 400));
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError("Question not found", 404));
  }

  if (!question.recipient.equals(req.user._id)) {
    return next(new AppError("Forbidden", 403));
  }

  const { answer, status, visibility } = req.body;
  if (answer) {
    question.answer = xss(answer);
    question.answeredAt = new Date();
    question.status = "answered";
  }
  if (status) {
    question.status = status;
  }
  if (visibility) {
    question.visibility = visibility;
  }

  await question.save();
  res.status(200).json(question);
});

export const deleteQuestion = catchAsync(async (req, res, next) => {
  const questionId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(new AppError("Invalid id", 400));
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return next(new AppError("Question not found", 404));
  }

  if (!question.recipient.equals(req.user._id)) {
    return next(new AppError("Forbidden", 403));
  }

  await Question.deleteOne({ _id: questionId });
  res.status(204).end();
});

export const likeQuestion = catchAsync(async (req, res, next) => {
  const questionId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return next(new AppError("Invalid id", 400));
  }

  // Find the question and verify it is answered and public
  const question = await Question.findOne({
    _id: questionId,
    status: "answered",
    visibility: "public"
  });

  if (!question) {
    return next(new AppError("Answered public question not found", 404));
  }

  // Atomically increment likes count
  question.likes += 1;
  await question.save();

  res.status(200).json(question);
});

