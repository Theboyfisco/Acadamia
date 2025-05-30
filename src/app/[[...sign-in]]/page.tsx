"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser, useOrganization } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Get user role from public metadata
    const role = user?.publicMetadata?.role as string;
    console.log('User authenticated with role:', role);
    
    // Route based on role
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'teacher') {
      router.push('/teacher');
    } else if (role === 'student') {
      router.push('/student');
    } else if (role === 'parent') {
      router.push('/parent');
    } else {
      // No role assigned yet
      router.push('/unauthorized');
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    // Assuming SignIn.Root or SignIn.Step handles the actual submission
    // This is a placeholder, the actual submission needs to be triggered
    // by Clerk Elements. We might need to rethink how to trigger submission
    // and manage loading state if Clerk Elements handles it internally.
    // For now, we'll just manage the visual loading state.
    // In a real scenario, you'd integrate this with Clerk's submission handler.
    // Since we are using Clerk Elements, the form submission is likely handled
    // by the <SignIn.Root> and <SignIn.Action> components automatically.
    // Let's revert the button change and see if we can use a state provided by Clerk Elements.
    setLoading(false); // This line is just for demonstration of state toggle
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Welcome section */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-[url('/Loginscreen.png')] bg-cover bg-center bg-white bg-opacity-80">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="BIU Logo" width={40} height={40} />
            <h1 className="text-3xl font-bold text-gray-800">BIU</h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
          <p className="text-gray-600 text-lg">
            Sign in to access your school dashboard and manage your educational journey.
          </p>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
      <SignIn.Root>
        <SignIn.Step
          name="start"
            className="w-full max-w-md"
        >
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <Image src="/logo.png" alt="BIU Logo" width={32} height={32} />
              <h1 className="text-2xl font-bold text-gray-800">BIU</h1>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sign in</h2>
              <p className="text-gray-500 mb-6">Enter your credentials to access your account</p>
              
              <Clerk.GlobalError className="text-sm text-red-500 mb-4" />
              
              <div className="space-y-4">
                <Clerk.Field name="identifier" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-gray-700">
              Username
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your username"
            />
                  <Clerk.FieldError className="text-sm text-red-500" />
          </Clerk.Field>

                <Clerk.Field name="password" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-gray-700">
              Password
            </Clerk.Label>
            <div className="relative">
              <Clerk.Input
                type={showPassword ? "text" : "password"}
                required
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
                  <Clerk.FieldError className="text-sm text-red-500" />
          </Clerk.Field>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-blue-500 hover:text-blue-600">Forgot password?</a>
                </div>

          <SignIn.Action
            submit
                  className="w-full bg-blue-500 text-white rounded-lg py-3 px-4 font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In
          </SignIn.Action>
              </div>
            </div>
        </SignIn.Step>
      </SignIn.Root>
      </div>
    </div>
  );
};

export default LoginPage;
