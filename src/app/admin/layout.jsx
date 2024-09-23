"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/contexts/FirestoreContext";

const AdminLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { adminsData } = useFirestore();

  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Please login first!",
        description: "",
        className: "bg-red-500 text-white border border-red-700",
      });
      router.push("/login");
    }
    if (currentUser && adminsData) {
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
        router.push("/login");
      }
    }
  }, [currentUser, router, adminsData]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return <div>{children}</div>;
};

export default AdminLayout;
