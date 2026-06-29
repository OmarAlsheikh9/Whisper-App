import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import Question  from "../models/questionModel.js";
import xss from "xss";

export const getProfile = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  let user = await User.findOne({ username: username }).select("-email");
  if (!user) return next(new AppError("user not found", 404));
  res.status(200).json(user );
});
export const updateMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  
  // Sanitize profile details to prevent XSS
  const updates = { ...req.body };
  if (updates.displayName) updates.displayName = xss(updates.displayName);
  if (updates.bio) updates.bio = xss(updates.bio);
  
  user.set(updates);
  const updatedUser = await user.save();
  res.status(200).json(updatedUser );
});
export const sendQuestion = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  let user = await User.findOne({ username: username }).select("-email");
  if (!user) return next(new AppError("user not found", 404));
  if(!user.acceptingQuestions) return next(new AppError("Recipient is not accepting questions",403));
  const {body}= req.body;
  let newQuestion = await Question.create({
    askedBy: req.user?._id ?? null,
    recipient: user._id,
    body: xss(body)
  });

  // Emit real-time notification to the recipient user's socket room
  const io = req.app.get("io");
  if (io) {
    io.to(`room_${user._id.toString()}`).emit("new_question", {
      id: newQuestion._id.toString(),
      body: newQuestion.body,
      createdAt: newQuestion.createdAt
    });
  }

  let questionObj = newQuestion.toObject();
delete questionObj.recipient;
delete questionObj.askedBy;
res.status(201).json(questionObj);
});
export const getPublicQuestionsForUser = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const { page, limit } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;

  const user = await User.findOne({ username: username });
  if (!user) return next(new AppError("User not found", 404));

  const query = { recipient: user._id, visibility: "public", status: "answered" };

  const total = await Question.countDocuments(query);

  const data = await Question.find(query)
    .sort({ answeredAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .select("-recipient"); // username is already in the URL, don't leak it again

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    data,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
  });
})
