"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Keep NextAuth session state available to all client components below layout.
  return <SessionProvider>{children}</SessionProvider>;
}
