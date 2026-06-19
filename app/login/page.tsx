"use client";

import React from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();

  // Preserve the destination that triggered login, especially protected upload links.
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <main className="min-h-[80vh] bg-gray-50/50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col items-center">
        
        {/* Brand link gives users an easy escape back to the public gallery. */}
        <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-2xl tracking-tight mb-2">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <span>CaseVault</span>
        </Link>
        
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mt-3">Welcome Back</h2>
        <p className="text-xs text-gray-400 font-medium mt-1 text-center max-w-[240px]">
          Sign in to access secure publishing features and view team decks.
        </p>

        {/* Provider buttons share the same callback so both flows return consistently. */}
        <div className="w-full flex flex-col gap-3.5 mt-8">
          <button 
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 flex items-center justify-center gap-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 bg-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.51 1.7 15 1 12 1 7.35 1 3.41 3.65 1.5 7.5l3.75 2.9C6.12 7.15 8.83 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.2-2.35H12v4.5h6.46c-.28 1.47-1.11 2.71-2.35 3.55l3.65 2.83c2.14-1.97 3.39-4.88 3.39-8.53z"/>
              <path fill="#FBBC05" d="M5.25 14.6c-.25-.75-.39-1.55-.39-2.38s.14-1.63.39-2.38L1.5 6.94C.54 8.88 0 11.04 0 12.38s.54 3.5 1.5 5.44l3.75-2.92z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.92l-3.65-2.83c-1.01.68-2.31 1.08-3.91 1.08-3.17 0-5.88-2.11-6.84-5.36L1.81 15.8C3.72 19.65 7.65 23 12 23z"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-center gap-3 text-sm font-bold text-white transition-all shadow-md shadow-gray-900/10"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.024A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.293 2.747-1.024 2.747-1.024.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Continue with GitHub
          </button>

        </div>

        <span className="text-[10px] text-gray-400 font-medium mt-8 text-center max-w-[280px]">
          We safely secure authentication tokens using standard cryptographic encryption. No password files are captured.
        </span>

      </div>
    </main>
  );
}
