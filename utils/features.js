import jwt from 'jsonwebtoken'
export const createCookie = (user, res, statusCode = 200) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "15d" });

  const fifteenDaysInMilliseconds = 15 * 24 * 60 * 60 * 1000;

  return res.status(statusCode).cookie("token", token, {
    path: "/",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none", 
    secure: process.env.NODE_ENV !== "development", // HTTPS for production only
    maxAge: fifteenDaysInMilliseconds, // Expire in 15 days
  });
};

export const deleteCookie = (req, res) => {
  res.cookie("token", "", { 
    path: "/",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none", 
    secure: process.env.NODE_ENV !== "development", // Secure in production
    expires: new Date(Date.now()), // Expire immediately
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
export const getCorrectWrong =(correctWrong) =>{
    const newCorrectWrong = [...correctWrong]
    const correctCharCount = newCorrectWrong.filter(
          (status) => status === "correct"
        ).length;
    const mistakes = newCorrectWrong.filter(
          (status) => status === "wrong"
        ).length;
      return {
        correctCharCount,
        mistakes 
      }
  }
 export  const calWPM = (correctChars) =>{
    let wpm = correctChars/5;
    
    if (wpm > 0) {
      wpm = Math.round(wpm);
    }else {
      wpm = 0;
    }
    return wpm;
  }
  export const calPercentage = (completed,total)=>{
      const percentage = Math.floor((completed/total)*100)
      return percentage
  }
