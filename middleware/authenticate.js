import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import JWT from "jsonwebtoken";
import { promisify } from "util";

const authenticate = catchAsync(async (req, res, next) => {
  let token;
  
  // Try Authorization header in dev
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Try cookie in production
  else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }
  
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  try{
    const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
  
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  
  req.user = currentUser;
  next();
  }catch(err){
  return next(new AppError("Invalid or expired token", 401));
  }

});

export default authenticate;
