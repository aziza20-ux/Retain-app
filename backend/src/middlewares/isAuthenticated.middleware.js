import jwt from "jsonwebtoken";

// Verifies the Bearer JWT in the Authorization header.
// On success, attaches { id, role } to req.user and calls next().
// On failure, responds with 401 — never exposes token details or secrets.
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Reject requests that are missing the Authorization header or use a non-Bearer scheme.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Strip the "Bearer " prefix to get the raw token string.
  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach only the fields controllers need — never expose the full payload.
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuthenticated;
