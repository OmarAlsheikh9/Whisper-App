import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export const signup = catchAsync(async (req, res, next) => {
  const existingUser = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  });

  if (existingUser) {
    if (existingUser.username === req.body.username)
      return next(new AppError("Username is already taken", 409));
    if (existingUser.email === req.body.email)
      return next(new AppError("Email is already taken", 409));
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  req.body.password = hashedPassword;
  let newUser = await User.create(req.body);
  const id = newUser._id;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({ user: newUser, token });
});

export const login = catchAsync(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("email or password not correct", 401));
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return next(new AppError("email or password not correct", 401));
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({ token, user });
});
export const getMe = catchAsync(async (req,res,next)=>{
  res.status(200).json(req.user);
});
