import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRoute.js'
import userRouter from './routes/usersRoute.js'
import questionsRouter from './routes/questionsRoute.js'
import feedRouter from './routes/feedRoute.js'
// Empty-mode starter — only /health works. Everything else is yours to build.
//
// Your job:
// - design your routes / controllers / middleware / models / validations
// - mount them on this app
// - add an error handler (centralized JSON errors) and a 404 handler
//
// See: docs/API.md for the full contract.

const app = express();
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

// TODO: mount your routes here — e.g. app.use('/api/auth', authRoutes);
app.use("/api/auth",authRouter);
app.use("/api/users",userRouter);
app.use("/api/questions",questionsRouter);
app.use("/api/feed",feedRouter);

// TODO: add a 404 handler for unknown /api/* routes.
app.use((req,res)=>{
  res.status(404).json({status:"NOT FOUND",message:"URL not found"});
});
// TODO: add a centralized error handler: `(err, req, res, next) => { ... }`.
app.use((err,req,res,next)=>{
  // res.json({ "error": { "message": "...", "details": [ ... ] } })
  res.status(err.statusCode|| 500).json({"error": { "message": err.message || "Internal Server Error", "status": err.status || "error"}})
})
const PORT = process.env.PORT || 3000;

await connectDB();
app.listen(PORT, () => console.log(`whisper listening on ${PORT}`));
