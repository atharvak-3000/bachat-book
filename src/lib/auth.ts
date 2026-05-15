import prisma from "./prisma";
import { Member, Organization } from "@prisma/client";

export type MemberWithOrg = Member & { organization: Organization };

export async function getCurrentMember(userId: string): Promise<MemberWithOrg | null> {
  const member = await prisma.member.findFirst({
    where: {
      clerkUserId: userId,
    },
    include: {
      organization: true,
    },
  });

  return member as MemberWithOrg | null;
}

export async function requireAdmin(userId: string): Promise<MemberWithOrg> {
  const member = await getCurrentMember(userId);

  if (!member || member.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return member;
}
