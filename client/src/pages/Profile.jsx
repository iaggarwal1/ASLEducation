import React from "react";
import { useSelector } from "react-redux";

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);

  const handleSignOut = () => {
    // Implement your sign out logic here
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <div className="flex flex-col gap-4">
        <div className="bg-slate-100 rounded-lg p-5 shadow-md">
          <h3 className="text-xl font-semibold">{currentUser.username}</h3>
          <p className="text-gray-600 mt-2">Email: {currentUser.email}</p>
          {/* Add more details here if needed */}
        </div>
      </div>
      <div className="flex justify-end mt-5">
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md shadow-md transition duration-300"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
