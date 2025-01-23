import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { createCookie, deleteCookie } from "../utils/features.js";
import ErrorHandler from "../middlewares/error.js";
import jwt from 'jsonwebtoken'

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return next(new ErrorHandler("User already exists", 409));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });
    createCookie(user, res, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res,next) => {

  try {
    
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 404));
    }
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return next(new ErrorHandler("Invalid email or password", 404));
    }
    createCookie(user, res, `Welcome back ${user.name}`, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  deleteCookie(req, res);
};

export const sendText = (req,res)=>{
  try{
    const text1 = `Paragraphs are the building blocks of papers. Many students define paragraphs in terms of length: a paragraph is a group of at least five sentences, a paragraph is half a page long, etc. In reality, though, the unity and coherence of ideas among sentences is what constitutes a paragraph.
    Paragraphs are the building blocks of papers. Many students define paragraphs in terms of length: a paragraph is a group of at least five sentences, a paragraph is half a page long, etc. In reality, though, the unity and coherence of ideas among sentences is what constitutes a paragraph.
    Paragraphs are the building blocks of papers. Many students define paragraphs in terms of length: a paragraph is a group of at least five sentences, a paragraph is half a page long, etc. In reality, though, the unity and coherence of ideas among sentences is what constitutes a paragraph.`;
    const text2 = `The Great Wall of China is the longest man-made structure in the world, standing at approximately 13,043 miles (20,465 kilometers) long and 6,100 miles (9,840 kilometers) high. It was built primarily for defense against invasions from invading forces, primarily the Mongol Empire, and is the only significant structure in the world`;
    const text3 = `Muhammad Ali Jinnah (born Mahomedali Jinnahbhai; 25 December 1876  11 September 1948) was a barrister, politician, and the founder of Pakistan. Jinnah served as the leader of the All-India Muslim League from 1913 until the inception of Pakistan on 14 August`
    res.json({ text1, text2, text3 });
  }
  catch(error){
    next(error);
  }
}

export const apiMessage = (req,res)=>{
  res.send("<h1>User API running...</h1>")
}

export const getLoginInfo = async(req, res,next) =>{
  try {
    
    const token = req.cookies.token;
    if (token) {
      const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
      const user = await User.findOne({ _id: decodedData._id }); 
      res.json({
      success:true,
      message: `Welcome back ${user.name}`,
      user: user, // Include user data in the response
      });
    }
  } catch (error) {
    next(error);
  }
}