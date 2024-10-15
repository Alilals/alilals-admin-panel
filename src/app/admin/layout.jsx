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
    } else {
      const isAdmin = adminsData.some(
        (admin) => admin.email === currentUser.email
      );
      if (!isAdmin && adminsData.length) {
        logout();
        router.push("/login");
        toast({
          title: "Access Denied",
          description: "You have been removed from the admins list.",
          className: "bg-red-500 text-white border border-red-700",
        });
      }
    }
  }, [currentUser, adminsData, logout, router, toast]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return <div>{children}</div>;
};

export default AdminLayout;
