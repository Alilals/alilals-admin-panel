"use client";

import React, { useEffect } from "react";
import WelcomeScreen from "../components/Welcome-screen";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  return <WelcomeScreen />;
}
