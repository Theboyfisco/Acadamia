"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import { useState } from "react";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className={`flex-1 md:flex-none md:flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2 transition-all duration-300 ${
            isSearchFocused ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
          } ${isMobileMenuOpen ? 'hidden' : 'flex'} md:w-[300px]`}>
            <button aria-label="Search" className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors">
              <Image src="/search.png" alt="" width={16} height={16} />
        </button>
        <input
          type="text"
              placeholder="Search anything..."
          aria-label="Search"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-transparent outline-none text-sm text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-300"
        />
      </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
          </button>

            {/* Messages */}
            <button 
              className="relative p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Open messages"
            >
              <Image src="/message.png" alt="Messages" width={20} height={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          </button>

            {/* Announcements */}
            <button 
              className="relative p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="View announcements"
            >
              <Image src="/announcement.png" alt="Announcements" width={20} height={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs font-medium animate-bounce-slow">
                1
              </span>
            </button>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.publicMetadata?.role as string}
                </p>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 hover:scale-110 transition-transform duration-300"
                  }
                }}
              />
            </div>

            {/* Mobile User Button */}
            <div className="md:hidden">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-2 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-slide-in">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {user?.publicMetadata?.role as string}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2">
                <button aria-label="Search" className="text-gray-400 dark:text-gray-300">
                  <Image src="/search.png" alt="" width={16} height={16} />
                </button>
                <input
                  type="text"
                  placeholder="Search anything..."
                  aria-label="Search"
                  className="w-full bg-transparent outline-none text-sm text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-300"
                />
              </div>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
