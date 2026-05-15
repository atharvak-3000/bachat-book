import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentMember } from "@/lib/auth";

export default async function Home() {
  const { userId } = await auth();

  // If logged in, determine where to send them
  if (userId) {
    const member = await getCurrentMember(userId);

    if (member) {
      if (member.role === "ADMIN") {
        redirect("/dashboard");
      } else {
        redirect("/member");
      }
    }

    // Not a member, check for pending request
    const pendingRequest = await prisma.joinRequest.findFirst({
      where: { clerkUserId: userId, status: "PENDING" },
    });

    if (pendingRequest) {
      redirect("/pending-approval");
    }

    // Nothing found, send to join/discovery
    redirect("/join");
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-6xl font-extrabold text-orange-600 tracking-tighter">
          BachatBook
        </h1>
        
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            बचत गट व्यवस्थापन आता <br />
            <span className="text-orange-500">सोपे आणि सुरक्षित</span>
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            The modern financial platform for Women's Self-Help Groups. 
            Track savings, loans, and meetings with 100% accuracy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-orange-700 hover:scale-105 transition-all"
          >
            सुरुवात करा (Get Started)
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto bg-white text-orange-600 border-2 border-orange-100 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-orange-50 transition-all"
          >
            लॉगिन करा (Login)
          </Link>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <FeatureCard 
            title="Digital Passbook" 
            desc="Every member gets a digital record of their savings." 
          />
          <FeatureCard 
            title="Loan Tracking" 
            desc="Automated interest calculation and repayment tracking." 
          />
          <FeatureCard 
            title="Marathi Support" 
            desc="Full bilingual interface for easy understanding." 
          />
        </div>
      </div>
      
      <footer className="mt-20 text-gray-400 text-xs font-bold uppercase tracking-widest">
        © 2024 BachatBook • Made for Maharashtra
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-orange-100">
      <h3 className="font-bold text-orange-600 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
