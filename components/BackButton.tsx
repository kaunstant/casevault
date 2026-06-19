"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string;
  className?: string;
  iconOnly?: boolean;
  fallbackHref?: string;
}

export default function BackButton({
  label = "Back",
  className = "",
  iconOnly = false,
  fallbackHref = "/",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Use browser history first so nested flows return to the page that opened them.
    if (window.history.length > 1) {
      router.back();
      return;
    }

    // Direct visits have no useful history entry, so keep a predictable fallback.
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={className}
    >
      {/* The same compact arrow is used on upload and update screens. */}
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
