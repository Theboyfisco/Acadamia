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
  const [rememberMe, setRememberMe] = useState(false);

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
    setLoading(false); // Reset loading state when sign-in is complete
  }, [isLoaded, isSignedIn, user, router]);

  // Reset loading state if sign-in fails
  useEffect(() => {
    if (!isLoaded && loading) {
      setLoading(false);
    }
  }, [isLoaded, loading]);

  // Announce loading state to screen readers
  useEffect(() => {
    let announcement: HTMLDivElement | null = null;
    
    if (loading) {
      announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Signing in, please wait...';
      document.body.appendChild(announcement);
    }

    return () => {
      if (announcement && announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    };
  }, [loading]);

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
      <SignIn.Root>
        <SignIn.Step
          name="start"
            className="w-full max-w-md"
        >
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <Image src="/logo.png" alt="Logo" width={160} height={80} className="object-contain" unoptimized />
            </div>
            
            <div className="mb-8">
              <div className="mb-6">
                <Image src="/logo.png" alt="Logo" width={360} height={90} className="object-contain" unoptimized />
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">Sign in</h2>
                <p className="!text-black dark:text-gray-400">Enter your credentials to access your account</p>
              </div>
              
              <Clerk.GlobalError role="alert" aria-live="assertive">
                {({ message, code }) => (
                  <div className="text-sm text-red-600 mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1">{message || 'An unknown error occurred. Please try again.'}</span>
                  </div>
                )}
              </Clerk.GlobalError>
              
              <div className="space-y-6">
                <Clerk.Field name="identifier" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium !text-black dark:text-white group flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Username
                  </Clerk.Label>
                  <Clerk.Input
                    type="text"
                    required
                    aria-required="true"
                    aria-label="Username"
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 !text-black !bg-white/50 dark:text-white dark:bg-gray-700/50 hover:border-blue-400 focus:scale-[1.02] shadow-sm !caret-black"
                    placeholder="Enter your username"
                  />
                  <Clerk.FieldError role="alert" aria-live="assertive">
                    {({ message, code }) => (
                      <div className="text-sm text-red-600 flex items-start gap-1.5 mt-1">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{message || 'Please check your username.'}</span>
                      </div>
                    )}
                  </Clerk.FieldError>
                </Clerk.Field>

                <Clerk.Field name="password" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium !text-black dark:text-white group flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </Clerk.Label>
                  <div className="relative">
                    <Clerk.Input
                      type={showPassword ? "text" : "password"}
                      required
                      aria-required="true"
                      aria-label="Password"
                      className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 !text-black !bg-white/50 dark:text-white dark:bg-gray-700/50 hover:border-blue-400 focus:scale-[1.02] shadow-sm !caret-black"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm leading-5 !text-black dark:text-gray-400 hover:text-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <Clerk.FieldError role="alert" aria-live="assertive">
                    {({ message, code }) => (
                      <div className="text-sm text-red-600 flex items-start gap-1.5 mt-1">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{message || 'Please enter your password.'}</span>
                      </div>
                    )}
                  </Clerk.FieldError>
                </Clerk.Field>

                <div className="flex items-center justify-between pt-2">
                  <label 
                    className="flex items-center gap-2 group cursor-pointer"
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={rememberMe}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setRememberMe(!rememberMe);
                      }
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-md border-gray-300 text-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-600 transition-all duration-200 hover:border-blue-400" 
                    />
                    <span className="text-sm !text-black dark:text-gray-400 group-hover:text-blue-500 transition-colors duration-200">Remember me</span>
                  </label>
                  <a 
                    href="#" 
                    aria-label="Reset your password"
                    className="text-sm text-black dark:text-blue-400 hover:text-blue-600 transition-colors duration-200 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                  >
                    Forgot password?
                  </a>
                </div>

                <SignIn.Action
                  submit
                  aria-label="Sign in to your account"
                  aria-busy={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl py-4 px-4 font-semibold hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl mt-6"
                  onClick={() => setLoading(true)}
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white transition-all duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
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
