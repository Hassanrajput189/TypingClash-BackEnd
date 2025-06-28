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
