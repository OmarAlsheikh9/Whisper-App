import catchAsync from "../utils/catchAsync.js";
import Question from "../models/questionModel.js";
import User from "../models/userModel.js";

export const getPublicQuestions = catchAsync(async (req, res, next) => {
  const { tag, q, page, limit, cursor } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;

  const tagStr = typeof tag === "string" ? tag : undefined;
  const qStr = typeof q === "string" ? q : undefined;
  const cursorStr = typeof cursor === "string" ? cursor : undefined;

  // Base filter: only answered public questions
  const query = { status: "answered", visibility: "public" };

  // If a cursor is provided for pagination, select items older than the cursor
  if (cursorStr) {
    query._id = { $lt: cursorStr };
  }

  // If a search query is provided, search inside body or answer
  if (qStr) {
    query.$or = [
      { body: { $regex: qStr, $options: 'i' } },
      { answer: { $regex: qStr, $options: 'i' } }
    ];
  }

  // If a tag is provided, first find all users who have that tag
  if (tagStr) {
    const usersWithTag = await User.find({ tags: tagStr }).select("_id");
    // Extract just the _id values into an array
    const userIds = usersWithTag.map((u) => u._id);
    // Add recipient filter to only include questions from those users
    query.recipient = { $in: userIds };
  }

  const total = await Question.countDocuments({ status: "answered", visibility: "public" });

  const dataQuery = Question.find(query)
    .sort({ answeredAt: -1, _id: -1 })
    .limit(limitNum)
    .populate("recipient", "username displayName avatarUrl tags"); // safe projection

  // Only use skip if doing traditional offset pagination (no cursor)
  if (!cursorStr && page) {
    dataQuery.skip((pageNum - 1) * limitNum);
  }

  const data = await dataQuery;
  const totalPages = Math.ceil(total / limitNum);

  // Set the next cursor as the ID of the last item in the current batch
  const nextCursor = data.length > 0 ? data[data.length - 1].id : null;

  res.status(200).json({
    data,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    nextCursor
  });
});
