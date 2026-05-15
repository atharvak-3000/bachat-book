import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import MigrationWizard from "@/components/migration/MigrationWizard";

export default async function MigrationPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await requireAdmin(userId);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">BachatBook Migration Setup</h1>
          <p className="text-gray-500">Welcome to {admin.organization.name}. Let's get your existing group's data into the system.</p>
        </div>
        
        <MigrationWizard organization={admin.organization} />
      </div>
    </div>
  );
}
