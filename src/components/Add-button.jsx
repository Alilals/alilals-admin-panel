import React from "react";
import { Plus } from "lucide-react";

const AddButton = ({ onClick, label = "Add" }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transform transition duration-300 hover:scale-105"
    >
      <Plus className="w-5 h-5 mr-2" />
      {label}
    </button>
  );
};

export default AddButton;
