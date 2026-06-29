import { rateLimit, ipKeyGenerator } from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
keyGenerator: (req, res) => {
  const ip = req.ip || ipKeyGenerator(req, res);
  const username = req.params.username || "anonymous";
  return `${ip}-${username}`;
},
  message: "Too many requests, please try again after an hour.",
});

export default limiter;
