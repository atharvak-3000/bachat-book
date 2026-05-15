import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SignOutButton } from "@clerk/nextjs";
import StatusRefresher from "@/components/auth/StatusRefresher";
import Link from "next/link";

export default async function PendingApprovalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Check for ANY request from this user
  const latestRequest = await prisma.joinRequest.findFirst({
    where: { clerkUserId: userId },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  const member = await prisma.member.findFirst({
    where: { clerkUserId: userId },
  });

  // If already a member, redirect to their home
  if (member) {
    redirect(member.role === "ADMIN" ? "/dashboard" : "/member");
  }

  if (!latestRequest) {
    redirect("/join");
  }

  const isRejected = latestRequest.status === "REJECTED";

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-orange-100 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className={`w-20 h-20 ${isRejected ? 'bg-red-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto`}>
          {isRejected ? (
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-orange-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
            {isRejected ? (
              <>तुमचा विनंती अर्ज <span className="text-red-600">नाकारला</span> आहे</>
            ) : (
              <>तुमचा विनंती अर्ज <span className="text-orange-600">प्रलंबित</span> आहे</>
            )}
          </h1>
          <p className="text-gray-500 font-medium">
            {isRejected 
              ? `Your request to join ${latestRequest.organization.name} was not approved by the administrator.`
              : `Your request to join ${latestRequest.organization.name} is awaiting administrator approval.`
            }
          </p>
        </div>

        <div className={`${isRejected ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} p-4 rounded-2xl border`}>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center justify-center gap-2">
            {!isRejected && <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />}
            <span className={`text-sm font-bold uppercase tracking-tighter ${isRejected ? 'text-red-700' : 'text-yellow-700'}`}>
              {isRejected ? "Rejected / नाकारले" : "Pending Approval / प्रलंबित"}
            </span>
          </div>
        </div>

        <div className="pt-4 space-y-4">
           {!isRejected ? (
             <>
               <p className="text-xs text-gray-400 italic">Please check back later once an admin has approved your request.</p>
               <StatusRefresher />
             </>
           ) : (
             <Link 
               href="/join" 
               className="block w-full bg-orange-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shadow-lg"
             >
               Try Joining Another Group
             </Link>
           )}
           
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
