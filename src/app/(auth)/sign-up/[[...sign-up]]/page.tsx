import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">BachatBook</h1>
        <p className="text-orange-800 font-medium text-lg">
          नवीन बचत गट नोंदणी
        </p>
      </div>
      <SignUp />
    </div>
  );
}
