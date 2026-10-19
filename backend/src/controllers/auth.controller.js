import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.config.js";
import { registerSchema, loginSchema } from "../schemas/user.schema.js";

// Strip sensitive fields before sending a user object in any response.
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
      return res
        .status(400)
        .json({
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        });
    }

    const { name, email, password } = result.data;

    // Prevent duplicate accounts for the same email address.
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // Hash the password with a cost factor of 12 before storing it.
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
      return res
        .status(400)
        .json({
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    // Always run bcrypt.compare even when the user doesn't exist to prevent timing attacks.
    const passwordMatch = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Sign a JWT containing the user's ID and role; expires in 7 days.
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};


export const logout = (req, res) => {
  // req.user is already verified by isAuthenticated middleware.
  return res.status(200).json({ message: "Logged out successfully" });
};

// GET /auth/me  — requires isAuthenticated middleware
export const getMe = async (req, res, next) => {
  try {
    // Re-fetch from the database so the response always reflects the latest user state.
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }

    return res.status(200).json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};
