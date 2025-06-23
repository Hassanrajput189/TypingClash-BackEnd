import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { createCookie, deleteCookie } from "../utils/features.js";
import ErrorHandler from "../middlewares/error.js";


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

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1. Find user with the provided email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 404));
    }

    // 2. Compare password
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return next(new ErrorHandler("Invalid email or password", 404));
    }

    // 3. Create and set JWT in cookie
    const cookie = createCookie(user, res, 200);

    // 4. Remove password from user object before sending it in response
    const userObj = user.toObject();
    delete userObj.password;

    // 5. Send response with user info
    res.status(200).json({
      success: true,
      message: `Welcome back ${user.name}`,
      user: userObj, // User info (without password)
    });
  } catch (error) {
    next(error);
  }
};
export const logout = (req, res) => {
  deleteCookie(req, res);
};

export const sendText = (req, res, next) => {
  try {
    const textEasy = `paragraphs are important in writing. they help organize ideas and make the message easier to understand. instead of counting sentences or lines, focus on the meaning. if the sentences talk about the same topic and make sense together, then it is a paragraph. writing good paragraphs takes practice and clarity.`;

    const textMedium = `The Quick Brown fox jumps Over 13 lazy DOGS in the Zoo. Today, 2025 students Attended the 3rd Annual Science Fair. They Exhibited 7 new inventions and shared 100 ideas for future Projects. The event Started at 9am and ended at 5pm, with Guest speakers from 12 different Countries and 5 tech Companies.`;

    const textHard = `Muhammad Ali Jinnah (born 25/12/1876) was a barrister, politician, and founder of Pakistan. He led the All-India Muslim League until 14-Aug-1947. Known as "Quaid-e-Azam", he played a key role in the Two-Nation Theory. Contact: jinnah@pak.gov.pk | Website: www.pakistan.gov.pk | Motto: "Unity, Faith & Discipline!"`;

    res.json({ textEasy, textMedium, textHard });
  } catch (error) {
    next(error);
  }
};


export const getUser = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
