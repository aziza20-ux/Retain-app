const isAdmin = (req, res, next) => {
  // isAuthenticated should always run first, but guard defensively in case it doesn't.
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Reject authenticated users who do not hold the ADMIN role.
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Forbidden: admin access required" });
  }

  next();
};

export default isAdmin;
