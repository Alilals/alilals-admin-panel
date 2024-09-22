"use client";

import { useFirestore } from "@/contexts/FirestoreContext";
import React from "react";
import * as LucideIcons from "lucide-react";

const DashboardCards = () => {
  const { adminsData, blogsData } = useFirestore();

  const cards = [
    {
      title: "Admins",
      count: adminsData.length,
      icon: "Crown",
    },
    {
      title: "Blogs",
      count: blogsData.length,
      icon: "Newspaper",
    },
    {
      title: "Products",
      count: 0,
      icon: "ShoppingBag",
    },
    {
      title: "Services",
      count: 0,
      icon: "Wrench",
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
              className="relative w-80 h-48 bg-purple-100 py-8 px-5 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
            >
              <div className="text-3xl font-bold text-purple-600 mb-6">
                {card.title}
              </div>
              <div className="text-4xl font-extrabold text-gray-800">
                {card.count}
              </div>
              <div className="absolute top-6 right-6 bg-purple-300 p-3 rounded-full">
                {<IconComponent className="text-purple-700 h-8 w-8" />}
              </div>
              <div className="absolute inset-0 rounded-xl bg-purple-200 opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
            </div>
          );
        })}
    </div>
  );
};

export default DashboardCards;
