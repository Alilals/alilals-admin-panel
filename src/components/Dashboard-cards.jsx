"use client";

import { useFirestore } from "@/contexts/FirestoreContext";
import React from "react";
import * as LucideIcons from "lucide-react";

const DashboardCards = () => {
  const {
    adminsData,
    blogsData,
    statsData,
    projectsData,
    applesData,
    usersCount,
  } = useFirestore();

  const cards = [
    {
      title: "Admins",
      count: adminsData.length,
      icon: "Crown",
    },
    {
      title: "Apple Varieties",
      count: applesData.length,
      icon: "AppleIcon",
    },
    {
      title: "Blogs",
      count: blogsData.length,
      icon: "Newspaper",
    },
    {
      title: "Projects",
      count: projectsData.length,
      icon: "FolderRoot",
    },
    {
      title: "Stats",
      count: statsData.length,
      icon: "ChartArea",
    },
    {
      title: "Users",
      count: usersCount,
      icon: "Users",
    },
  ];

  return (
    <div className="flex gap-6 flex-wrap">
      {cards &&
        cards.map((card, key) => {
          const IconComponent = LucideIcons[card.icon];
          return (
            <div
              key={key}
              className="relative w-80 h-48 bg-green-100 py-8 px-5 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
            >
              <div className="text-3xl font-bold text-green-600 mb-6">
                {card.title}
              </div>
              <div className="text-4xl font-extrabold text-gray-800">
                {card.count}
              </div>
              <div className="absolute top-6 right-6 bg-green-300 p-3 rounded-full">
                {<IconComponent className="text-green-700 h-8 w-8" />}
              </div>
              <div className="absolute inset-0 rounded-xl bg-green-200 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
            </div>
          );
        })}
    </div>
  );
};

export default DashboardCards;
