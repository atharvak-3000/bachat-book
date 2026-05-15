import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { format } from "date-fns";
import AddMemberForm from "@/components/members/AddMemberForm";

export default async function MembersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await requireAdmin(userId);

  const members = await prisma.member.findMany({
    where: {
      organizationId: admin.organizationId,
      isActive: true,
    },
    orderBy: {
      memberNumber: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-500">Manage your Gat members</p>
        </div>
        {/* We'll use a simple button that toggles a form for now, or just Link */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Members Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{member.memberNumber}</td>
                    <td className="px-6 py-4">
                      <Link href={`/members/${member.id}`} className="font-bold text-gray-900 group-hover:text-orange-600">
                        {member.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{member.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        member.role === "ADMIN" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(member.joiningDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/members/${member.id}`} className="text-xs font-bold text-orange-600 hover:underline">
                        Passbook
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Member Form (Sidebar style) */}
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm h-fit">
          <h3 className="font-bold text-gray-900 mb-6">Add New Member</h3>
          <AddMemberForm />
        </div>
      </div>
    </div>
  );
}
