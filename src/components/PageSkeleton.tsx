import React from 'react';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[80vh] flex flex-col gap-6 p-8 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3"></div>
      <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
      <div className="flex gap-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/2"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/2"></div>
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl w-full"></div>
    </div>
  );
};
