import jwt from "jsonwebtoken";

export const createCookie = (user, res, message, statusCode = 200) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  const fifteenDaysInMilliseconds = 15 * 24 * 60 * 60 * 1000;

  res.status(statusCode).cookie("token", token, {
    path: "/",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? 'lax' : 'none',
    secure: process.env.NODE_ENV === "development" ? false : true,
    maxAge: fifteenDaysInMilliseconds, // Set maxAge for 15 days
  });

  res.json({
    success: true,
    message,
  });
};
export const deleteCookie = (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? 'lax' : 'none',
    secure: process.env.NODE_ENV === "development" ? false : true,
  });
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};
