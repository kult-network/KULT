import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-[#0a0a0a] p-6 w-full animate-pulse flex flex-col gap-4 border border-[#222] rounded-xl">
    <div className="flex items-center gap-4 mb-2">
      <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#222]"></div>
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-[#1a1a1a] rounded w-32"></div>
        <div className="h-3 bg-[#111] rounded w-20"></div>
      </div>
    </div>
    <div className="h-3 bg-[#111] rounded w-full"></div>
    <div className="h-3 bg-[#111] rounded w-5/6"></div>
    <div className="mt-4 h-10 bg-[#1a1a1a] rounded-lg w-24"></div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
