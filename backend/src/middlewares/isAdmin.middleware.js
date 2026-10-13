// isAdmin.middleware.js
// Must be used AFTER isAuthenticated in the middleware chain.
// Relies on req.user.role set by isAuthenticated from the verified JWT payload.
//
// Security note: role reflects the value at token issuance. If an admin's role
// is revoked, the change will not take effect until their current token expires
// and a new one is issued. A short token lifetime or a token revocation strategy
// (e.g. a blocklist) can mitigate this if needed in the future.

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
