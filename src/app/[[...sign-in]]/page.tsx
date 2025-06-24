"use client";

import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      const role = user.publicMetadata?.role as string;
      if (role === 'admin') router.push('/admin');
      else if (role === 'teacher') router.push('/teacher');
      else if (role === 'student') router.push('/student');
      else if (role === 'parent') router.push('/parent');
      else router.push('/unauthorized');
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Show a loading spinner while checking auth or redirecting
  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Only render SignIn if NOT signed in
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left side - Welcome section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[url('/Loginscreen.png')] bg-cover bg-center">
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        {/* Text Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to Our School!</h2>
          <p className="text-lg opacity-90">
            Sign in to access your personalized student dashboard and explore resources designed to help you succeed.
          </p>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F9F6F1]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="Logo" width={160} height={80} className="object-contain" unoptimized />
          </div>
          
          <div className="mb-8">
            <div className="mb-6">
              <Image src="/logo.png" alt="Logo" width={360} height={90} className="object-contain" unoptimized />
            </div>
          </div>

          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100",
                headerTitle: "text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent",
                headerSubtitle: "!text-black dark:text-gray-400",
                formButtonPrimary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600",
                formFieldInput: "!text-black !bg-white/50",
                footerActionLink: "text-blue-600 hover:text-blue-700"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
