'use client';

import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-200/80 rounded-md ${className}`} />
  );
}

export function TableSkeleton({ rows = 6, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white rounded-xl border border-zinc-200 overflow-hidden p-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-100">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Row skeletons */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-zinc-50 last:border-0">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-28 hidden md:block" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
