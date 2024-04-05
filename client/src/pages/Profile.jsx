import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "../redux/user/userSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout");
      dispatch(signOut());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <div className="flex flex-col gap-4">
        <div className="bg-slate-100 rounded-lg p-5 shadow-md">
          <h3 className="text-xl font-semibold">{currentUser.username}</h3>
          <p className="text-gray-600 mt-2">Email: {currentUser.email}</p>
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
      <p className="text-red-700 mt-5">{error && "Something went wrong!"}</p>
    </div>
  );
}
