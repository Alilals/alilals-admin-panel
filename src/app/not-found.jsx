"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-400 via-green-600 to-green-900 text-white">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold animate-pulse">404</h1>
        <h2 className="text-4xl font-bold mt-4">Oops! Page Not Found</h2>
        <p className="mt-4 text-xl">
          It seems like you've strayed too far from the map...
        </p>
        <p className="mt-2 text-lg">No worries, we'll get you back on track!</p>
      </div>

      <div className="mt-10 animate-bounce">
        <Image
          src="https://media.giphy.com/media/l378zKVk7Eh3yHoJi/giphy.gif"
          alt="Dancing 404"
          className="w-40 h-40 rounded-full"
        />
      </div>

      <button
        className="mt-8 bg-white text-green-700 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 hover:text-white transition duration-300 transform hover:scale-110"
        onClick={() => router.push("/")}
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound;
