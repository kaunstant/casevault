"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface UploadLinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function UploadLink({ children, className = "", onClick }: UploadLinkProps) {
  const { status } = useSession();

  // Keep every upload entry point protected without duplicating auth checks.
  const href = status === "authenticated" ? "/upload" : "/login?callbackUrl=/upload";

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
