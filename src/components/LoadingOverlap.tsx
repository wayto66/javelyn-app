import { useEffect } from "react";

const LoadingOverlap = () => {
  return (
    <>
      <div className="fixed   top-0 left-0 z-[998] block h-2 w-screen bg-gray-700 "></div>
      <div className="loading-bar   fixed top-0 left-0 z-[999] block h-2 bg-jpurple"></div>
    </>
  );
};

export default LoadingOverlap;
