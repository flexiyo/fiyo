import React from "react";
import { useNavigate } from "react-router-dom";

const NotConnectedToInternet = () => {
  const navigate = useNavigate();

  const handleNavigateToMusic = () => {
    navigate("/music");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-200">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2">You're Offline</h1>
        <p className="text-lg text-gray-500 mb-6">
          It seems like you’re not connected to the internet. Check your connection to access online features.
        </p>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          onClick={handleNavigateToMusic}
        >
          Enjoy Local Music
        </button>
        <p className="text-lg mt-3 text-blue-500 underline mb-6 cursor-pointer" onClick={() => window.location.reload()}>Reload the page</p>
      </div>
    </div>
  );
};

export default NotConnectedToInternet;
