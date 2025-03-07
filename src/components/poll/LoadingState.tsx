
import React from "react";

const LoadingState = () => {
  return (
    <div className="container max-w-4xl py-16 mx-auto">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
