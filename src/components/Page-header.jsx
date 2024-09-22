import React from "react";

const PageHeader = ({ title }) => {
  return (
    <div className="w-full flex items-center bg-green-600 h-[8rem]">
      <div className="text-white text-4xl font-bold px-10">{title}</div>
    </div>
  );
};

export default PageHeader;
