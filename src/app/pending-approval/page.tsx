import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SignOutButton } from "@clerk/nextjs";

export default async function PendingApprovalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const pendingRequest = await prisma.joinRequest.findFirst({
    where: { clerkUserId: userId, status: "PENDING" },
    include: { organization: true },
  });

  if (!pendingRequest) {
    // If no request but also no membership, go to join
    const member = await prisma.member.findFirst({
      where: { clerkUserId: userId },
    });
    if (member) redirect(member.role === "ADMIN" ? "/dashboard" : "/member");
    redirect("/join");
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-orange-100 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-orange-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
            तुमचा विनंती अर्ज <span className="text-orange-600">प्रलंबित</span> आहे
          </h1>
          <p className="text-gray-500 font-medium">
            Your request to join <span className="text-gray-900 font-bold">{pendingRequest.organization.name}</span> is awaiting administrator approval.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
            <span className="text-sm font-bold text-yellow-700 uppercase tracking-tighter">Pending Approval</span>
          </div>
        </div>

        <div className="pt-4 space-y-3">
           <p className="text-xs text-gray-400 italic">Please check back later once an admin has approved your request.</p>
           <div className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer">
             <SignOutButton />
           </div>
        </div>
      </div>
      
      <p className="mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        BachatBook • Security First
      </p>
    </div>
  );
}
