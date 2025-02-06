import { prisma } from "../db.config.js";

export const createCertificationAlarm = async (certificationId: number, scheduleId: number) => {
  // 해당 스케줄이 존재하는지 확인
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId, certificationId },
  });

  if (!schedule) {
    throw new Error("해당 certificationId와 scheduleId에 대한 일정이 존재하지 않습니다.");
  }

  // CertificationAlram 생성
  const certificationAlarm = await prisma.certificationAlram.create({
    data: {
      scheduleId,
      alramState: true, // 기본값 true
    },
  });

  return certificationAlarm;
};
