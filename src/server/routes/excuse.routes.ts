import { Router } from "express";
import { dbStore } from "../db/store";
import { ExcuseRequest } from "../../shared/types/attendance";
import crypto from "crypto";

export const excuseRouter = Router();

excuseRouter.post("/", async (req, res, next) => {
  try {
    const { studentId, studentName, classId, className, instructorId, reason, evidenceDataUrl, dateOfAbsence } = req.body;
    
    if (!studentId || !classId || !reason || !dateOfAbsence) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const excuse: ExcuseRequest = {
      id: crypto.randomUUID(),
      studentId,
      studentName,
      classId,
      className,
      instructorId,
      reason,
      evidenceDataUrl,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      dateOfAbsence
    };

    const saved = await dbStore.addExcuseRequest(excuse);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

excuseRouter.get("/student/:id", async (req, res, next) => {
  try {
    const excuses = await dbStore.getExcuseRequestsByStudent(req.params.id);
    res.json(excuses);
  } catch (err) {
    next(err);
  }
});

excuseRouter.get("/class/:id", async (req, res, next) => {
  try {
    const excuses = await dbStore.getExcuseRequestsByClass(req.params.id);
    res.json(excuses);
  } catch (err) {
    next(err);
  }
});

excuseRouter.get("/instructor/:id", async (req, res, next) => {
  try {
    const excuses = await dbStore.getExcuseRequestsByInstructor(req.params.id);
    res.json(excuses);
  } catch (err) {
    next(err);
  }
});

excuseRouter.put("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const { dbStore } = require("../db/store");
    const excuse = dbStore['excuseRequests'].find(e => e.id === req.params.id);
    if (!excuse) return res.status(404).json({ error: "Not found" });
    excuse.status = status;
    res.json(excuse);
  } catch (err) {
    next(err);
  }
});
