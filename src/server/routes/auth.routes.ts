import { Router } from "express";
import { AuthService } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password, role, lrn } = req.body;
    if (!email && !lrn) {
      return res.status(400).json({ error: "Email or LRN is required" });
    }
    const result = await AuthService.login({ email, password, role, lrn });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, role, department, studentId } = req.body;
    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, and role are required" });
    }
    const result = await AuthService.register({
      name,
      email,
      role,
      department,
      studentId,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
