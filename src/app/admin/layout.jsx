"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Please login first!",
        description: "",
        className: "bg-red-500 text-white border border-red-700",
      });
      router.push("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return <div>{children}</div>;
};

export default AdminLayout;
