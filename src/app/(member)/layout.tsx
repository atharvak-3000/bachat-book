import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SignOutButton } from "@clerk/nextjs";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const member = await getCurrentMember(userId);

  if (!member) {
    // Check if pending request exists
    const pendingRequest = await prisma.joinRequest.findFirst({
      where: { clerkUserId: userId, status: "PENDING" },
    });
    if (pendingRequest) redirect("/pending-approval");
    redirect("/join");
  }

  if (member.role === "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-orange-50/30">
      <header className="bg-white border-b border-orange-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-orange-600">BachatBook</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{member.organization.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">{member.name}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Member Portal</p>
          </div>
          <div className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm border border-gray-200 cursor-pointer">
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
