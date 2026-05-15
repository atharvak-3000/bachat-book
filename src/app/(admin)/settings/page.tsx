import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await requireAdmin(userId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500">Configure your Gat profile and financial rules</p>
      </div>

      <SettingsForm organization={admin.organization} />
    </div>
  );
}
