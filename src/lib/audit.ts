import prisma from "./prisma";

export async function createAuditLog({
  organizationId,
  userId,
  action,
  entityType,
  entityId,
  beforeData,
  afterData,
}: {
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData?: any;
  afterData?: any;
}) {
  return await prisma.auditLog.create({
    data: {
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      beforeData: beforeData ? JSON.parse(JSON.stringify(beforeData)) : null,
      afterData: afterData ? JSON.parse(JSON.stringify(afterData)) : null,
    },
  });
}
