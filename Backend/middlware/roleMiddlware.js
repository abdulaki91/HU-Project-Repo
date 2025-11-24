import jwt from "jsonwebtoken";
export const roleMiddleware = (requiredRoles) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decoded.role;

    if (requiredRoles.includes(userRole)) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
};
