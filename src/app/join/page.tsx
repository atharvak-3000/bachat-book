import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import JoinClient from "@/components/join/JoinClient";

export default async function JoinPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check if already a member
  const member = await prisma.member.findFirst({
    where: { clerkUserId: userId },
  });

  if (member) {
    redirect(member.role === "ADMIN" ? "/dashboard" : "/member");
  }

  // Check if pending request exists
  const pendingRequest = await prisma.joinRequest.findFirst({
    where: { clerkUserId: userId, status: "PENDING" },
    include: { organization: true },
  });

  if (pendingRequest) {
    redirect("/pending-approval");
  }

  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      village: true,
      district: true,
    },
  });

  return (
    <div className="min-h-screen bg-orange-50/30 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-orange-600 tracking-tight">बचत गटात सामील व्हा</h1>
          <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">Join an existing Bachat Gat</p>
        </div>

        <JoinClient initialOrganizations={organizations} />
      </div>
    </div>
  );
}
