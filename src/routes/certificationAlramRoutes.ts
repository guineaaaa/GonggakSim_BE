import express from "express";
import { handleCreateOrUpdateCertificationAlarm } from "../controllers/certificationAlram.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/certifications/:certificationId/notifications",
  verifyJWT,
  (req, res) => handleCreateOrUpdateCertificationAlarm(req, res)
);

export default router;