import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Simple loading spinner
export const LoadingSpinner = ({ className, size = "default" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
};

// Loading state for buttons
export const LoadingButton = ({ loading, children, loadingText, className, ...props }) => {
  return (
    <button 
      disabled={loading}
      className={cn(
        "flex items-center justify-center transition-all duration-200",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2" size="sm" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

// Full page loading overlay
export const LoadingOverlay = ({ message = "Загрузка..." }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="xl" className="text-amber-500" />
          <p className="text-white text-lg font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton for cards
export const LoadingSkeleton = ({ className }) => {
  return (
    <div className={cn(
      "animate-pulse bg-gray-800/50 rounded-lg",
      className
    )} />
  );
};

// Loading state for lists
export const LoadingList = ({ count = 3, itemHeight = "h-20" }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton 
          key={index} 
          className={cn("w-full", itemHeight)}
        />
      ))}
    </div>
  );
};

// Loading state for cards grid
export const LoadingCards = ({ count = 6, cols = 3 }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn("grid gap-6", gridCols[cols])}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-4">
          <LoadingSkeleton className="aspect-[4/3] w-full" />
          <LoadingSkeleton className="h-6 w-3/4" />
          <LoadingSkeleton className="h-4 w-1/2" />
          <LoadingSkeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
};