import catchAsync from "../utils/catchAsync.js";
import Question from "../models/questionModel.js";
import User from "../models/userModel.js";

export const getPublicQuestions = catchAsync(async (req, res, next) => {
  const { tag, page, limit } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;

  // Base filter: only answered public questions
  const query = { status: "answered", visibility: "public" };

  // If a tag is provided, first find all users who have that tag
  if (tag) {
    
    const usersWithTag = await User.find({ tags: tag }).select("_id");
    // Extract just the _id values into an array
    const userIds = usersWithTag.map((u) => u._id);
    // Add recipient filter to only include questions from those users
    query.recipient = { $in: userIds };
  }

  const total = await Question.countDocuments(query);

  const data = await Question.find(query)
    .sort({ answeredAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate("recipient", "username displayName avatarUrl tags"); // safe projection

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    data,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
  });
});
