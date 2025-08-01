import express from 'express';
import cors from 'cors';
import userRoutes from './routes/route.js';
import cookieParser from 'cookie-parser';
import { handleError } from "./middlewares/error.js";
import { config } from "dotenv";
import { Server } from "socket.io";
import http from "http";
import { setupSocket } from "./socket.js";
import { connectDB } from "./data/database.js";

// Load environment variables
config({
  path: "./data/config.env",
});

// Express app setup
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Cookie",
    "User-Agent"
  ],
}));

app.use(express.json({limit: "20kb"}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true ,limit: "20kb"}));
app.use('/api/users/', userRoutes);
app.use(handleError);

app.get("/", (req, res) => {
  res.send("<h1>API running...</h1>");
});

// HTTP & Socket.io setup
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Also update the Socket.io CORS config
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling'],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Cookie",
      "User-Agent"
    ],
  }
});

connectDB().then(() => {
  server.on('error', (error) => {
    console.error("Server error:", error.message);
  });
  setupSocket(io);
  server.listen(() => {
  console.log(`Server is running on port ${port}`);
 });
}).catch((error) => {
  console.error("Database connection failed:", error.message);
  process.exit(1);
});


