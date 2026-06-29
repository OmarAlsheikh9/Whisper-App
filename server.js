import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRouter from './routes/authRoute.js'
import userRouter from './routes/usersRoute.js'
import questionsRouter from './routes/questionsRoute.js'
import feedRouter from './routes/feedRoute.js'

const app = express();
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public')); // serve the frontend UI

// Create HTTP server and configure Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io accessible globally in controllers
app.set("io", io);

io.on("connection", (socket) => {
  // When user joins, subscribe them to their private notifications room
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`room_${userId}`);
    }
  });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// TODO: mount your routes here — e.g. app.use('/api/auth', authRoutes);
app.use("/api/auth",authRouter);
app.use("/api/users",userRouter);
app.use("/api/questions",questionsRouter);
app.use("/api/feed",feedRouter);

// TODO: add a 404 handler for unknown /api/* routes.
app.use("/api", (req, res) => {
  res.status(404).json({ status: "NOT FOUND", message: "API Route not found" });
});
// Catch all other non-API routes (like frontend pages)
app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});
// TODO: add a centralized error handler: `(err, req, res, next) => { ... }`.
app.use((err,req,res,next)=>{
  // res.json({ "error": { "message": "...", "details": [ ... ] } })
  res.status(err.statusCode|| 500).json({"error": { "message": err.message || "Internal Server Error", "status": err.status || "error"}})
})
const PORT = process.env.PORT || 3000;

await connectDB();
server.listen(PORT, () => console.log(`whisper listening on ${PORT}`));
