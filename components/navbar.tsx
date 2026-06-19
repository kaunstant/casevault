"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import UploadLink from "@/components/UploadLink";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keep the account menu behaving like a normal dropdown instead of a sticky popover.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Placeholder sections are kept in the nav so the app shell is ready for expansion.
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "" },
    { name: "About", href: "" },
    { name: "Explore", href: "" },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Brand mark doubles as the safest way back to the public gallery. */}
      <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
        <div className="bg-blue-100 p-2 rounded-xl">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <span>CaseVault</span>
      </Link>

      {/* Desktop navigation stays compact while mobile keeps the header focused. */}
      <div className="hidden md:flex items-center gap-8 h-10 ml-48">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`relative pb-2 text-sm font-semibold transition-colors ${isActive ? "text-blue-600 border-b-3 border-blue-600" : "text-gray-600 hover:text-gray-900 hover-underline-expand"}`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Search and account controls live together so the right edge stays predictable. */}
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block mr-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search cases, topics, tags..."
            className="w-64 pl-9 pr-12 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 border border-gray-200 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-gray-400 font-mono pointer-events-none shadow-sm">
            Ctrl K
          </div>
        </div>

        {/* Authenticated users get publishing controls; guests get a single sign-in action. */}
        {status === "authenticated" ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 transition-all flex items-center justify-center font-bold text-sm relative shrink-0">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="User Profile"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}

                {/* Fallback avatar keeps the layout stable if the provider image is missing. */}
                <div
                  style={{
                    backgroundColor: (() => {
                      const str = session.user?.name || session.user?.email || "U";
                      let hash = 0;

                      for (let i = 0; i < str.length; i++) {
                        hash = str.charCodeAt(i) + ((hash << 5) - hash);
                      }

                      const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];
                      return colors[Math.abs(hash) % colors.length];
                    })(),
                  }}
                  className="absolute inset-0 text-white flex items-center justify-center uppercase font-bold text-base rounded-full select-none"
                >
                  {(session.user?.name || session.user?.email || "U").charAt(0)}
                </div>
              </div>

              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">{session.user?.email}</p>
                </div>

                <UploadLink
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Deck
                </UploadLink>

                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Your Profile
                </Link>

                <Link href="" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>

                <hr className="border-gray-100 my-1" />

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-blue-600/10 transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
