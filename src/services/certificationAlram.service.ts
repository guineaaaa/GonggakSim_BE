import { prisma } from "../db.config.js";

export const createOrUpdateCertificationAlarm = async (userId: number, scheduleId: number) => {
  // 1️. 기존 알람 조회
  const existingAlarm = await prisma.certificationAlram.findFirst({
    where: { userId, scheduleId },
  });

  if (existingAlarm) {
    if (existingAlarm.alramState) {
      throw new Error("이미 설정된 알람입니다.");
    }

    // 2. 기존 알람이 있다면 상태 업데이트 (false → true)
    await prisma.certificationAlram.update({
      where: { id: existingAlarm.id },
      data: { alramState: true },
    });

    return { message: "알람이 활성화되었습니다.", updated: true };
  }

  // 3️. 새로운 알람 생성
  const newAlarm = await prisma.certificationAlram.create({
    data: {
      userId,
      scheduleId,
      alramState: true, // 기본값 true
    },
  });

  return { message: "새로운 알람이 생성되었습니다.", alarmId: newAlarm.id };
};
