"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

const SearchField = ({ placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex items-center bg-purple-100 text-purple-700 rounded-lg shadow-md p-3 w-full max-w-md">
      <Search className="text-purple-500 w-5 h-5 mr-3" />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder={placeholder}
        className="bg-transparent flex-grow outline-none text-purple-700 placeholder-purple-400"
      />
    </div>
  );
};

export default SearchField;
