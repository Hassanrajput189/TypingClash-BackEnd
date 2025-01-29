import express from 'express';
import cors from 'cors';
import {config} from "dotenv";
import userRoutes from './routes/route.js'
import cookieParser from 'cookie-parser';
import {handleError} from "./middlewares/error.js"

const app = express();

config({
    path:"./data/config.env",
})

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://typing-clash-front-end.vercel.app",
    "https://typing-clash-front-end-git-main-hassanrajput189s-projects.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Cookie']
  
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users/',userRoutes);
app.use(handleError);

app.get("/",(req,res)=>{
  res.send("<h1>API running...</h1>")
})

export {app};