"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UploadLink from "@/components/UploadLink";

type UserSlide = {
  _id: string;
  title: string;
  summary: string;
  category: string;
  year: number;
  teamName?: string;
  previewImageUrl: string;
};

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [userSlides, setUserSlides] = useState<UserSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    // Profile is private, so unsigned users should never see the deck manager.
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Fetch only the current user's uploads from the protected API route.
      fetch(`/api/user-slides`)
        .then((res) => res.json())
        .then((data) => {
          setUserSlides(data);
          setLoading(false);
        });
    }
  }, [status, router]);

  const handleUpdate = (slideId: string) => {
    // The update page reads the id from the query string and hydrates its form.
    router.push(`/profile/update?id=${slideId}`);
  };

  const handleDelete = async (slideId: string) => {
    // Confirm destructive actions on the client before calling the database route.
    const confirmed = window.confirm("Delete this case from your profile? This cannot be undone.");
    if (!confirmed) return;

    setDeletingId(slideId);

    try {
      const res = await fetch(`/api/slides/${slideId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to delete this case.");
      }

      // Remove the card immediately after a successful delete to avoid a full reload.
      setUserSlides((slides) => slides.filter((slide) => slide._id !== slideId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete this case.");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) return <div className="text-center p-20 font-medium text-gray-400">Loading user portfolio...</div>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 flex-grow">
      {/* Header combines ownership context with the primary upload action. */}
      <div className="border-b border-gray-100 pb-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Decks</h1>
          <p className="text-xs font-medium text-gray-400 mt-1">Manage and edit your uploaded case presentations.</p>
        </div>
        <UploadLink className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10">
          Upload New Deck
        </UploadLink>
      </div>

      {userSlides.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-sm font-semibold text-gray-500">No materials indexed yet.</p>
        </div>
      ) : (
        /* Each card owns its update/delete controls so actions stay close to the deck. */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSlides.map((slide) => (
            <div key={slide._id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative">
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdate(slide._id)}
                  className="bg-white/90 hover:bg-white text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm border border-gray-100 backdrop-blur-sm transition-all flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                  Update
                </button>
                <button
                  type="button"
                  disabled={deletingId === slide._id}
                  onClick={() => handleDelete(slide._id)}
                  className="bg-white/90 hover:bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm border border-red-100 backdrop-blur-sm transition-all flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M19.228 5.79L18.16 19.673A2.25 2.25 0 0115.916 21.75H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .397c.34-.059.68-.114 1.022-.166m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  {deletingId === slide._id ? "Deleting" : "Delete"}
                </button>
              </div>

              <div className="w-full aspect-[4/3] bg-gray-50 overflow-hidden relative border-b border-gray-50">
                <img src={slide.previewImageUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md self-start mb-2.5">{slide.category}</span>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{slide.title}</h3>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 flex-grow">{slide.summary}</p>
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 border-t border-gray-50 pt-3.5 mt-4">
                  <span>{slide.teamName}</span>
                  <span>{slide.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
