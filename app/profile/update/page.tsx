"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";

function UpdateFormCore() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [saving, setSaving] = useState(false);
  const [loadingSlide, setLoadingSlide] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [newDeckFile, setNewDeckFile] = useState<File | null>(null);
  const [newPreviewFile, setNewPreviewFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    category: "",
    year: "",
    teamName: "",
    tagsInput: ""
  });

  useEffect(() => {
    // Editing is only available to authenticated owners.
    if (status === "unauthenticated") router.push("/login");

    if (id && status === "authenticated") {
      const loadSlide = async () => {
        // Hydrate editable fields from the database before the user starts editing.
        setLoadingSlide(true);
        setLoadError("");

        try {
          const res = await fetch(`/api/slides/${id}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Could not load this case.");
          }

          setForm({
            title: data.title || "",
            summary: data.summary || "",
            category: data.category || "",
            year: data.year ? data.year.toString() : "",
            teamName: data.teamName || "",
            tagsInput: Array.isArray(data.tags) ? data.tags.join(", ") : ""
          });
        } catch (err) {
          if (!(err instanceof Error)) {
            setLoadError("Could not load this case.");
            return;
          }

          setLoadError(err.message);
        } finally {
          setLoadingSlide(false);
        }
      };

      void loadSlide();
    }
  }, [id, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);

    // Only editable fields are sent; locked fields remain protected server-side.
    const updateData = new FormData();
    updateData.append("title", form.title);
    updateData.append("summary", form.summary);
    updateData.append("year", form.year);
    
    // Keep the UI simple while storing tags as an array in MongoDB.
    const parsedTags = form.tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    updateData.append("tags", JSON.stringify(parsedTags));

    if (newDeckFile) updateData.append("slideDeck", newDeckFile);
    if (newPreviewFile) updateData.append("previewImage", newPreviewFile);

    try {
      // PUT preserves the existing files unless a replacement was selected.
      const res = await fetch(`/api/slides/${id}`, {
        method: "PUT",
        body: updateData,
      });

      if (res.ok) {
        router.push("/profile");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error handling database updates.");
        setSaving(false);
      }
    } catch {
      alert("Error handling database updates.");
      setSaving(false);
    }
  };

  if (status === "loading" || (Boolean(id) && loadingSlide)) {
    return (
      <main className="w-full bg-gray-50/40 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 flex-grow min-h-[calc(100vh-70px)]">
        <div className="text-center text-sm font-medium text-gray-400">Loading case details...</div>
      </main>
    );
  }

  if (status === "authenticated" && !id) {
    return (
      <main className="w-full bg-gray-50/40 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 flex-grow min-h-[calc(100vh-70px)]">
        <div className="w-full max-w-xl bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-600">No case was selected for updating.</p>
          <BackButton
            label="Go back"
            fallbackHref="/profile"
            className="inline-flex items-center justify-center gap-1 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
          />
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="w-full bg-gray-50/40 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 flex-grow min-h-[calc(100vh-70px)]">
        <div className="w-full max-w-xl bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-600">{loadError}</p>
          <BackButton
            label="Go back"
            fallbackHref="/profile"
            className="inline-flex items-center justify-center gap-1 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-gray-50/40 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 flex-grow min-h-[calc(100vh-70px)]">
      <div className="w-full max-w-xl flex flex-col gap-5">
        {/* Back behavior follows browser history with profile as the direct-visit fallback. */}
        <div className="flex items-center gap-4">
          <BackButton
            iconOnly
            fallbackHref="/profile"
            className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Update Case Parameters</h1>
            <p className="text-xs font-medium text-gray-400 mt-0.5">Modify information metrics or append updated documents.</p>
          </div>
        </div>

        {/* The layout intentionally matches upload so users understand the edit flow quickly. */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3.5 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-700 w-5 h-5 rounded-md flex items-center justify-center text-[10px]">1</span>
              Replace Files (Optional)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Replacement files are optional; leaving these blank keeps current assets. */}
              <label className="border border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center bg-gray-50/30 cursor-pointer transition-all group">
                <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                </div>
                <span className="text-xs font-bold text-gray-700">New Thumbnail Image</span>
                <span className="text-[10px] text-gray-400 font-medium max-w-[180px] line-clamp-1">{newPreviewFile ? newPreviewFile.name : "Click to replace current file"}</span>
                <input type="file" accept="image/*" onChange={e => setNewPreviewFile(e.target.files?.[0] || null)} className="hidden" />
              </label>

              <label className="border border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center bg-gray-50/30 cursor-pointer transition-all group">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <span className="text-xs font-bold text-gray-700">Replace Slide Deck File</span>
                <span className="text-[10px] text-gray-400 font-medium max-w-[180px] line-clamp-1">{newDeckFile ? newDeckFile.name : "Click to select a new document asset file"}</span>
                <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={e => setNewDeckFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
          </div>

          {/* Category and team stay locked so ownership and classification remain stable. */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
              <span className="bg-gray-100 text-gray-700 w-5 h-5 rounded-md flex items-center justify-center text-[10px]">2</span>
              Case Details
            </h2>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-800 font-medium" required />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-500 block">Description</label>
                <span className="text-[10px] text-gray-400 font-medium">{form.summary.length}/300</span>
              </div>
              <textarea maxLength={300} rows={4} value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-800 font-medium resize-none" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1.5">Category (Locked)</label>
                <select disabled value={form.category} className="w-full border border-gray-100 bg-gray-50 text-gray-400 rounded-xl px-3 py-2.5 text-sm font-semibold cursor-not-allowed outline-none">
                  <option value={form.category}>{form.category || "Loading..."}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">Year</label>
                <select value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500" required>
                  {!form.year && <option value="">Select year</option>}
                  {["2026", "2025", "2024", "2023", "2022"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1.5">Team Name (Locked)</label>
              <input type="text" disabled value={form.teamName} className="w-full border border-gray-100 bg-gray-50 text-gray-400 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-not-allowed outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">Tags</label>
              <input type="text" value={form.tagsInput} onChange={e => setForm({...form, tagsInput: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-800 font-medium" />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 border-t border-gray-100 pt-5 mt-2">
            <Link href="/profile" className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-all">Cancel</Link>
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/10">
              {saving ? "Saving changes..." : "Commit Update Package"}
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}

export default function UpdatePage() {
  return (
    <Suspense fallback={<div className="text-center p-20 text-sm text-gray-400">Loading form view...</div>}>
      <UpdateFormCore />
    </Suspense>
  );
}
