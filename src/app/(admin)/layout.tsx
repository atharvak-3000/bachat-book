import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function AdminLayout({
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
    redirect("/onboarding");
  }

  if (member.role !== "ADMIN") {
    redirect("/member");
  }

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Members", href: "/members" },
    { name: "Meetings", href: "/meetings" },
    { name: "Loans", href: "/loans" },
    { name: "Requests", href: "/requests" },
    { name: "Reports", href: "/reports" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-orange-600 tracking-tight">BachatBook</h1>
            <p className="text-xs text-gray-500 font-medium truncate mt-1">
              {member.organization.name}
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-gray-900 truncate">{member.name}</span>
                <span className="text-xs text-gray-500">Administrator</span>
              </div>
            </div>
            <div className="w-full bg-white text-gray-700 border border-gray-200 py-2 rounded-lg text-sm font-bold text-center hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Nav (Bottom) */}
      <div className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around">
        {navLinks.slice(0, 4).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center p-2 text-gray-500 hover:text-orange-600 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase">{link.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
