import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

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
  
  const token = signAccessToken(id);
  const refreshToken = signRefreshToken(id);

  newUser.refreshToken = refreshToken;
  await newUser.save({ validateBeforeSave: false });

  res.status(201).json({ user: newUser, token, refreshToken });
});

export const login = catchAsync(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("email or password not correct", 401));
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return next(new AppError("email or password not correct", 401));
  
  const token = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ token, refreshToken, user });
});
export const getMe = catchAsync(async (req,res,next)=>{
  res.status(200).json(req.user);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please provide an email address", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // 1. Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash token and set it in database with an expiration date (10 minutes)
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  // In a real app: send email. For our learning demo, we return it in the response!
  res.status(200).json({
    status: "success",
    message: "Token generated successfully (demo mode: token attached)",
    token: resetToken
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return next(new AppError("Please provide token and new password", 400));
  }
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  // 1. Hash incoming token to match database
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Find user with matching token and valid expiration
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // 3. Update password and clear reset token fields
  user.password = await bcrypt.hash(password, 12);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully!"
  });
});

export const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  try {
    // 1. Verify refresh token signature and validity
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // 2. Find user matching token
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) {
      return next(new AppError("Invalid refresh token", 401));
    }

    // 3. Sign a brand new access token
    const accessToken = signAccessToken(user.id);

    res.status(200).json({
      status: "success",
      token: accessToken
    });
  } catch (err) {
    return next(new AppError("Expired or invalid refresh token", 401));
  }
});
