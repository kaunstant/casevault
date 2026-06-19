"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BackButton from "@/components/BackButton";

export default function UploadCasePage() {
  const router = useRouter();
  const { status } = useSession();
  const [saving, setSaving] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [deckFile, setDeckFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    category: "Strategy",
    year: "2026",
    competitionName: "",
    teamName: "",
    tagsInput: ""
  });

  React.useEffect(() => {
    // Direct visits to /upload should still respect authentication.
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/upload");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewFile || !deckFile) return alert("Please select both files before submission!");

    setSaving(true);

    // Multipart form data keeps metadata and files in one request.
    const dataToSend = new FormData();
    dataToSend.append("title", form.title);
    dataToSend.append("summary", form.summary);
    dataToSend.append("category", form.category);
    dataToSend.append("year", form.year);
    dataToSend.append("competitionName", form.competitionName || "Generic Invitational");
    dataToSend.append("teamName", form.teamName);
    
    // Tags are typed as a comma-separated field but stored as an array.
    const parsedTags = form.tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    dataToSend.append("tags", JSON.stringify(parsedTags));

    dataToSend.append("previewImage", previewFile);
    dataToSend.append("slideDeck", deckFile);

    const res = await fetch("/api/slides", {
      method: "POST",
      body: dataToSend,
    });

    if (res.ok) {
      router.push("/profile");
      router.refresh();
    } else {
      alert("Error handling multi-part transmission packet uploads.");
      setSaving(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return <div className="text-center p-20 font-medium text-gray-400">Checking account access...</div>;
  }

  return (
    <main className="w-full bg-gray-50/40 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 flex-grow min-h-[calc(100vh-70px)]">
      <div className="w-full max-w-xl flex flex-col gap-5">
        {/* Browser-history back keeps this page useful from home, profile, or direct links. */}
        <div className="flex items-center gap-4">
          <BackButton
            iconOnly
            fallbackHref="/"
            className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Upload Case</h1>
            <p className="text-xs font-medium text-gray-400 mt-0.5">Share your case competition slides with the community.</p>
          </div>
        </div>

        {/* The form mirrors the update page so publishing and editing feel consistent. */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3.5 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-700 w-5 h-5 rounded-md flex items-center justify-center text-[10px]">1</span>
              Upload Files
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* File inputs are hidden behind larger tap targets for easier uploads. */}
              <label className="border border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center bg-gray-50/30 cursor-pointer transition-all group">
                <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                </div>
                <span className="text-xs font-bold text-gray-700">Preview Image</span>
                <span className="text-[10px] text-gray-400 font-medium max-w-[180px] line-clamp-1">{previewFile ? previewFile.name : "Drag and drop or click to upload JPG, PNG up to 5MB"}</span>
                <input type="file" accept="image/*" onChange={e => setPreviewFile(e.target.files?.[0] || null)} className="hidden" />
              </label>

              <label className="border border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center bg-gray-50/30 cursor-pointer transition-all group">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <span className="text-xs font-bold text-gray-700">Slide Deck (PDF)</span>
                <span className="text-[10px] text-gray-400 font-medium max-w-[180px] line-clamp-1">{deckFile ? deckFile.name : "Drag and drop or click to upload PDF up to 50MB"}</span>
                <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={e => setDeckFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
          </div>

          {/* Metadata fields become the searchable and filterable case details. */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
              <span className="bg-gray-100 text-gray-700 w-5 h-5 rounded-md flex items-center justify-center text-[10px]">2</span>
              Case Details
            </h2>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">Title</label>
              <input type="text" placeholder="Enter a compelling title..." value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-300" required />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-500 block">Description</label>
                <span className="text-[10px] text-gray-400 font-medium">{form.summary.length}/300</span>
              </div>
              <textarea maxLength={300} rows={4} placeholder="Provide a short summary of the case problem and your insights..." value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-300 resize-none" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500">
                  <option value="Strategy">Strategy</option><option value="Finance">Finance</option><option value="Marketing">Marketing</option><option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">Year</label>
                <select value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500">
                  {[2026, 2025, 2024, 2023, 2022].map(y => <option key={y} value={y.toString()}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">Team Name</label>
              <input type="text" placeholder="e.g., Apex Strategy Group" value={form.teamName} onChange={e => setForm({...form, teamName: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-300" required />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">Tags</label>
              <input type="text" placeholder="Add tags (e.g., FinTech, Strategy, Marketing)" value={form.tagsInput} onChange={e => setForm({...form, tagsInput: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-800 placeholder-gray-300" />
              <span className="text-[10px] text-gray-400 block mt-1 font-medium">Press comma to separate tags</span>
            </div>
          </div>

          {/* Reset only clears metadata; selected files stay explicit in their controls. */}
          <div className="flex justify-end items-center gap-3 border-t border-gray-100 pt-5 mt-2">
            <button type="button" onClick={() => setForm({ title: "", summary: "", category: "Strategy", year: "2026", competitionName: "", teamName: "", tagsInput: "" })} className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-all">Reset</button>
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
              {saving ? "Uploading..." : "Upload Case"}
            </button>
          </div>
        </form>

        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
          </svg>
          <p className="text-[11px] text-purple-700 font-medium leading-relaxed">
            By uploading, you agree to our <Link href="/terms" className="underline font-bold">Terms of Service</Link> and confirm that you have the right to share this content.
          </p>
        </div>

      </div>
    </main>
  );
}
