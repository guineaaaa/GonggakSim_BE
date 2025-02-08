import express from "express";
import { handleCreateOrUpdateCertificationAlarm } from "../controllers/certificationAlram.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/certifications/:certificationId/notifications",
  verifyToken,
  (req, res) => handleCreateOrUpdateCertificationAlarm(req, res)
);

export default router;