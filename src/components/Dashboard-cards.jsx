import React from "react";

const DashboardCards = ({ title, count, icon: Icon }) => {
  return (
    <div className="relative w-80 h-48 bg-purple-100 py-8 px-5 rounded-xl">
      <div className="text-3xl font-bold text-purple-600 mb-6">{title}</div>
      <div className="text-4xl font-extrabold">{count}</div>
      <div className="absolute top-6 right-6 bg-purple-300 p-2 rounded-xl">
        {Icon && <Icon className="text-purple-700" />}
      </div>
    </div>
  );
};

export default DashboardCards;
