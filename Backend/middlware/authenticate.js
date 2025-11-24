import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};
