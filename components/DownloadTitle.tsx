"use client";

import React from "react";

interface DownloadTitleProps {
  title: string;
  slideUrl: string;
  documentUrl?: string;
}

export default function DownloadTitle({ title, slideUrl, documentUrl }: DownloadTitleProps) {
  const handleDownload = () => {
    // Prefer the stored document file when available, then fall back to the slide URL.
    const assetTarget = documentUrl || slideUrl;
    if (!assetTarget) return alert("No downloadable asset URL exists for this case!");
    
    // Use a temporary anchor so browser-native downloads work for local uploads.
    const link = document.createElement("a");
    link.href = assetTarget;
    link.download = `${title.replace(/\s+/g, "_")}_materials`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="text-left font-bold text-gray-900 hover:text-blue-600 hover:underline focus:outline-none transition-colors line-clamp-1 text-lg"
    >
      {title}
    </button>
  );
}
