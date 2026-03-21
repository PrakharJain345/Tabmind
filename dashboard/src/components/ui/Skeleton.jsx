import React from 'react';

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent";

export const SkeletonLine = ({ className = "" }) => (
  <div className={`h-4 bg-bg-elevated/50 rounded ${shimmer} ${className}`} />
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-bg-surface border border-white/5 rounded-2xl p-6 ${shimmer} ${className}`}>
    <div className="h-6 w-32 bg-bg-elevated/50 rounded mb-4" />
    <div className="h-10 w-20 bg-bg-elevated/50 rounded mb-2" />
    <div className="h-4 w-full bg-bg-elevated/50 rounded" />
  </div>
);

export const SkeletonRow = ({ className = "" }) => (
  <div className={`flex items-center gap-4 p-4 border-b border-white/5 ${shimmer} ${className}`}>
    <div className="h-8 w-8 bg-bg-elevated/50 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/3 bg-bg-elevated/50 rounded" />
      <div className="h-3 w-1/4 bg-bg-elevated/50 rounded" />
    </div>
    <div className="h-6 w-20 bg-bg-elevated/50 rounded" />
  </div>
);

export const SkeletonCircle = ({ className = "" }) => (
  <div className={`rounded-full bg-bg-elevated/50 ${shimmer} ${className}`} />
);

// Add keyframes to tailwind config or inject directly via style tag for shimmer
const Skeleton = () => null;
export default Skeleton;
