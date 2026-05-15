import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { format } from "date-fns";
import RequestActionButtons from "@/components/requests/RequestActionButtons";

export default async function RequestsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await requireAdmin(userId);

  const requests = await prisma.joinRequest.findMany({
    where: {
      organizationId: admin.organizationId,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Join Requests</h2>
        <p className="text-gray-500 font-medium">Manage pending membership requests for your Gat</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Requested Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{request.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{request.clerkUserId}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{request.phone || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {format(new Date(request.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <RequestActionButtons requestId={request.id} />
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                    No pending join requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
