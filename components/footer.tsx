import React from "react";
import Link from "next/link";
import UploadLink from "@/components/UploadLink";

export default function Footer() {
  // Footer links stay data-driven so unfinished sections can be filled in later.
  const linksSchema = [
    {
      title: "Platform",
      items: [
        { label: "Home", href: "" },
        { label: "Categories", href: "" },
        { label: "Upload", href: "/upload" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "About Us", href: "" },
        { label: "Guidelines", href: "" },
        { label: "Help Center", href: "" },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Privacy Policy", href: "" },
        { label: "Terms of Service", href: "" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand block anchors the footer and gives the product a concise close. */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xl font-bold text-gray-900 tracking-tight">
              <div className="bg-blue-600/10 p-1.5 rounded-lg text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM22.5 10.5V7.5a3 3 0 00-3-3h-6.32a3 3 0 01-2.12-.88L9.94 2.5a3 3 0 00-2.12-.88H4.5a3 3 0 00-3 3v5.88c.41-.24.87-.38 1.37-.38h18.26c.5 0 .96.14 1.37.38z" />
                </svg>
              </div>
              <span>CaseVault</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs font-normal leading-relaxed">
              Your hub for case competition slides and insights.
            </p>
          </div>

          {/* Link columns mirror the major app areas without taking over the footer. */}
          <div className="md:col-span-6 grid grid-cols-3 gap-6">
            {linksSchema.map((column) => (
              <div key={column.title} className="flex flex-col gap-3.5">
                <h4 className="text-sm font-bold text-gray-900 tracking-wide">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {column.items.map((link) => (
                    <li key={link.label}>
                      {/* Upload needs the auth-aware link while static links can stay plain. */}
                      {link.label === "Upload" ? (
                        <UploadLink className="text-gray-400 hover:text-blue-600 text-sm transition-colors font-medium">
                          {link.label}
                        </UploadLink>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-blue-600 text-sm transition-colors font-medium"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social links are isolated so real community handles can be dropped in later. */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-900 tracking-wide">
              Connect
            </h4>
            <div className="flex items-center gap-2.5">
              <a href="https://x.com" target="_blank" className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-full border border-gray-100 transition-all shadow-sm">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a href="https://www.linkedin.com" target="_blank" className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-full border border-gray-100 transition-all shadow-sm">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              <a href="https://www.instagram.com" target="_blank" className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-full border border-gray-100 transition-all shadow-sm">
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-50 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 font-medium">
          <p>© {new Date().getFullYear()} CaseVault Executive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
