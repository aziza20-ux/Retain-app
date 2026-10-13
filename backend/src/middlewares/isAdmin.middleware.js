

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: admin access required" });
  }

  next();
};

export default isAdmin;
