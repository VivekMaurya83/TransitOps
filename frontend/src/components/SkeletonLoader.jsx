import React from 'react';

// Common shimmer/pulsing container wrapper
const Shimmer = ({ className = '', children }) => (
  <div className={`animate-pulse bg-surface-container-high dark:bg-surface-container-low rounded-lg ${className}`}>
    {children || <div className="h-full w-full opacity-0">.</div>}
  </div>
);

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderItems = (templateFn) => {
    return Array.from({ length: count }).map((_, idx) => (
      <React.Fragment key={idx}>{templateFn(idx)}</React.Fragment>
    ));
  };

  if (type === 'card') {
    return renderItems((i) => (
      <div className="bg-surface rounded-xl p-6 border border-outline-variant/20 shadow-sm flex flex-col space-y-4">
        <Shimmer className="h-4 w-1/3" />
        <Shimmer className="h-8 w-2/3" />
        <div className="flex space-x-2 pt-2">
          <Shimmer className="h-5 w-12 rounded-full" />
          <Shimmer className="h-4 w-20" />
        </div>
      </div>
    ));
  }

  if (type === 'table') {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden w-full">
        {/* Table header skeleton */}
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center gap-4 bg-surface-container-lowest dark:bg-surface-container-low">
          <Shimmer className="h-6 w-40" />
          <div className="flex space-x-2 w-full sm:w-auto">
            <Shimmer className="h-8 w-full sm:w-48" />
            <Shimmer className="h-8 w-8" />
          </div>
        </div>
        
        {/* Table rows skeleton */}
        <div className="p-4 space-y-3">
          {Array.from({ length: count || 4 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-outline-variant/10">
              <Shimmer className="h-5 w-24" />
              <Shimmer className="h-5 w-32 hidden sm:block" />
              <Shimmer className="h-5 w-20" />
              <Shimmer className="h-6 w-16 rounded-full" />
              <Shimmer className="h-5 w-24 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-surface rounded-xl p-6 border border-outline-variant/20 shadow-sm flex flex-col h-full w-full">
        <div className="flex justify-between items-center mb-6">
          <Shimmer className="h-6 w-32" />
          <Shimmer className="h-8 w-28" />
        </div>
        <div className="flex-1 bg-surface-container-low/40 rounded-lg min-h-[300px] flex items-end p-4 gap-3 relative overflow-hidden border border-outline-variant/10">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-6 opacity-30">
            <div className="border-b border-outline-variant w-full" />
            <div className="border-b border-outline-variant w-full" />
            <div className="border-b border-outline-variant w-full" />
            <div className="border-b border-outline-variant w-full" />
          </div>
          {/* Animated vertical pulsing bars to simulate loading data points */}
          {Array.from({ length: 12 }).map((_, i) => {
            const heights = ['h-1/3', 'h-1/2', 'h-2/3', 'h-1/4', 'h-3/4', 'h-2/5', 'h-3/5', 'h-4/5', 'h-1/2', 'h-2/3', 'h-3/4', 'h-4/5'];
            return (
              <Shimmer 
                key={i} 
                className={`flex-1 ${heights[i % heights.length]} rounded-t`} 
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {renderItems((i) => (
          <div className="flex items-center space-x-4 p-4 bg-surface rounded-xl border border-outline-variant/20 shadow-sm">
            <Shimmer className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-1/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="bg-surface rounded-xl p-8 border border-outline-variant/20 shadow-sm space-y-6">
        <div className="space-y-2">
          <Shimmer className="h-6 w-48" />
          <Shimmer className="h-4 w-80" />
        </div>
        <hr className="border-outline-variant/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: count || 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Shimmer className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return null;
}
