import { Request, Response } from "express";
import { createOrUpdateCertificationAlarm } from "../services/certificationAlram.service.js";

export const handleCreateOrUpdateCertificationAlarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, scheduleId } = req.body;

    if (!userId || !scheduleId) {
      res.status(400).json({ success: false, message: "userId와 scheduleId가 필요합니다." });
      return;
    }

    const result = await createOrUpdateCertificationAlarm(userId, scheduleId);
    
    res.status(200).json({ success: true, message: result.message });
    return; 
  } catch (error: any) {
    if (error.message === "이미 설정된 알람입니다.") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "서버 오류 발생", error: error.message });
    return;
  }
};
