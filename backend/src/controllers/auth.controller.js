import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.config.js";
import { registerSchema, loginSchema } from "../schemas/user.schema.js";




const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    }

    const { name, email, password } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout
// JWT is stateless — the server cannot invalidate a token that has already been
// issued. This endpoint exists so the frontend has a consistent API call to
// clear its React Context authentication state. The client MUST discard the
// token from memory on receipt of this response. The token remains
// cryptographically valid until its 7-day expiry; for this summative project
// that limitation is acceptable and is documented here.
export const logout = (req, res) => {
  // req.user is already verified by isAuthenticated middleware.
  return res.status(200).json({ message: "Logged out successfully" });
};

// GET /auth/me  — requires isAuthenticated middleware
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }

    return res.status(200).json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};
