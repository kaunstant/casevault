import React from "react";
import connectDB from "@/lib/db";
import Slide from "@/lib/models/Slide";
import FilterControls from "@/components/FilterControls";
import Link from "next/link";
import DownloadTitle from "@/components/DownloadTitle";
import UploadLink from "@/components/UploadLink";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  // The gallery is request-driven because filters and pagination come from the URL.
  await connectDB();

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const searchQuery = params.search || "";
  const currentCategory = params.category || "All Categories";
  const currentSort = params.sort || "Latest";

  const LIMIT = 6;
  const skip = (currentPage - 1) * LIMIT;

  // Mongo query stays small and composable so each filter can be added independently.
  const query: any = {};

  if (searchQuery) {
    query.$or = [
      { title: { $regex: searchQuery, $options: "i" } },
      { summary: { $regex: searchQuery, $options: "i" } },
      { competitionName: { $regex: searchQuery, $options: "i" } }
    ];
  }

  if (currentCategory !== "All Categories") {
    query.category = currentCategory;
  }

  let sortCriteria: any = { createdAt: -1 };
  if (currentSort === "Oldest") sortCriteria = { createdAt: 1 };
  if (currentSort === "Title A-Z") sortCriteria = { title: 1 };

  let rawSlides = [];
  let totalCount = 0;

  try {
    // Retry the connection check before querying because local dev can hot-reload models.
    if (!Slide.db.readyState) {
      await connectDB();
    }

    const [fetchedSlides, fetchedCount] = await Promise.all([
      Slide.find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(LIMIT)
        .lean(),
      Slide.countDocuments(query),
    ]);

    rawSlides = fetchedSlides;
    totalCount = fetchedCount;
  } catch (err) {
    console.log("Database connection retry triggered successfully:", err);

    // One fallback pass keeps the gallery usable during brief database reconnects.
    await connectDB();
    rawSlides = await Slide.find(query).sort(sortCriteria).skip(skip).limit(LIMIT).lean();
    totalCount = await Slide.countDocuments(query);
  }

  // Normalize uploader data so cards never render an empty team line.
  const slides = rawSlides.map((slide: any) => ({
    ...slide,
    uploadedBy: slide.uploadedBy && typeof slide.uploadedBy === "object" && "name" in slide.uploadedBy
      ? slide.uploadedBy
      : { name: "Team Alpha" }
  }));

  const totalPages = Math.ceil(totalCount / LIMIT);

  // Preserve active filters while moving between pages.
  const createPageUrl = (pageNumber: number) => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set("search", searchQuery);
    if (currentCategory !== "All Categories") newParams.set("category", currentCategory);
    if (currentSort !== "Latest") newParams.set("sort", currentSort);
    newParams.set("page", pageNumber.toString());
    return `/?${newParams.toString()}`;
  };

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 px-6 lg:px-16 max-w-7xl mx-auto w-full">

      {/* Hero row gives context and keeps the upload action visible on the first screen. */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Discover. Learn. <span className="text-blue-600">Win.</span>
          </h1>
          <p className="text-gray-500 mt-3 text-base lg:text-lg max-w-xl font-medium">
            Explore case competition slides and insights from top teams around the world.
          </p>
        </div>
        <UploadLink className="self-start md:self-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload Case
        </UploadLink>
      </div>

      <FilterControls
        initialSearch={searchQuery}
        initialCategory={currentCategory}
        initialSort={currentSort}
      />

      {/* Count line confirms the current result window after filters are applied. */}
      <div className="flex items-center justify-between mb-6 border-t border-gray-100 pt-8">
        <h2 className="text-xl font-bold text-gray-900">All Cases</h2>
        <span className="text-sm text-gray-400 font-medium">
          Showing {totalCount === 0 ? 0 : skip + 1}-{Math.min(skip + LIMIT, totalCount)} of {totalCount}
        </span>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
          <p className="text-gray-400 font-medium text-lg">No case studies found matching criteria.</p>
        </div>
      ) : (
        /* Cards are article elements because each deck can stand as its own content item. */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {slides.map((slide: any) => (
            <article key={slide._id.toString()} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                <img
                  src={slide.previewImageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-lg shadow-sm">
                  {slide.category}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="mt-2">
                  <DownloadTitle
                    title={slide.title}
                    slideUrl={slide.slideUrl}
                    documentUrl={slide.documentUrl}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2 line-clamp-2 font-normal flex-grow">
                  {slide.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {slide.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="bg-gray-50 text-gray-500 font-medium px-2.5 py-1 text-xs rounded-md border border-gray-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-gray-400 border-t border-gray-50 pt-4 mt-5">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-600">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-2.533-3.076C17.892 14.624 16.908 14 15 14c-1.907 0-2.892.624-4.213 1.472a4.125 4.125 0 00-2.533 3.076 9.337 9.337 0 004.121.952 9.38 9.38 0 002.625-.372zm-3-11.128a3 3 0 11-6 0 3 3 0 016 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                    <span>{slide.teamName || "Team Alpha"}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-400">
                    <span>{slide.competitionName} ({slide.year})</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        /* Pagination links preserve filters and work naturally with browser history. */
        <div className="mt-12 flex justify-center items-center gap-2">
          <Link
            href={createPageUrl(currentPage - 1)}
            className={`p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 ${currentPage === 1 ? "pointer-events-none opacity-40" : ""
              }`}
          >
            Prev
          </Link>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isSelectedPage = pageNum === currentPage;
            return (
              <Link
                key={pageNum}
                href={createPageUrl(pageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${isSelectedPage
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {pageNum}
              </Link>
            );
          })}

          <Link
            href={createPageUrl(currentPage + 1)}
            className={`p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 ${currentPage === totalPages ? "pointer-events-none opacity-40" : ""
              }`}
          >
            Next
          </Link>
        </div>
      )}
    </main>
  );
}
