"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterControlsProps {
  initialSearch: string;
  initialCategory: string;
  initialSort: string;
}

export default function FilterControls({
  initialSearch,
  initialCategory,
  initialSort,
}: FilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);

  const categories = ["All Categories", "Strategy", "Finance", "Marketing", "Social Impact"];
  const sortOptions = ["Latest", "Oldest", "Title A-Z"];

  useEffect(() => {
    // Keep the URL as the source of truth so filters survive refreshes and sharing.
    const params = new URLSearchParams(searchParams.toString());

    // Any filter change should return the user to the first result page.
    params.set("page", "1");

    if (search) params.set("search", search);
    else params.delete("search");

    if (category !== "All Categories") params.set("category", category);
    else params.delete("category");

    if (sort !== "Latest") params.set("sort", sort);
    else params.delete("sort");

    router.push(`/?${params.toString()}`);
  }, [search, category, sort]);

  return (
    <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-3 w-full">
      
      {/* Search has the most width because it is the primary discovery control. */}
      <div className="relative w-full md:flex-grow">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search slides, titles, descriptions..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Category and sort are fixed-width on desktop to keep the toolbar aligned. */}
      <div className="w-full md:w-48 relative">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* The native select keeps keyboard behavior without custom menu code. */}
      <div className="w-full md:w-48 relative">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt} value={opt}>Sort by: {opt}</option>
          ))}
        </select>
        <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
