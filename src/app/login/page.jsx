"use client";

import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/contexts/FirestoreContext";

const page = () => {
  const { loginWithGoogle, currentUser, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { adminsData } = useFirestore();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      console.log(adminsData);
      console.log(currentUser);
      toast({
        title: "Logging in,,,",
        description: "",
        className: "bg-yellow-500 text-white border border-yellow-700",
        duration: 1000,
      });
    } catch (error) {
      toast({
        title: "Failed to login!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      const isEmailPresent = adminsData.some(
        (admin) => admin.email === currentUser.email
      );

      if (!isEmailPresent) {
        logout();
        toast({
          title: "Unauthorized email",
          description: "",
          className: "bg-red-500 text-white border border-red-700",
        });
      } else {
        toast({
          title: "Logged in with google successfully!",
          description: "",
          className: "bg-green-500 text-white border border-green-700",
        });
      }
      router.push("/");
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-green-600 to-green-900">
      <div className="bg-white shadow-md rounded-lg p-10 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-700 mb-6">Welcome Back</h1>
        <p className="mb-6 text-gray-600">Sign in to access the admin panel</p>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <FcGoogle className="w-6 h-6 mr-2" /> Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default page;
