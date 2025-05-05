import React from "react";

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      <span className="ml-3 text-gray-700">Loading...</span>
    </div>
  );
};

export default Loader;
