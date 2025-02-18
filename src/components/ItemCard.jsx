import Link from "next/link";
import React from "react";

const ItemCard = ({ item, type }) => {
  return (
    <Link href={`/admin/${type}s/add${type}?${type}Id=${item.id}`}>
      <div
        className="relative w-80 h-72 rounded-md overflow-hidden shadow-lg cursor-pointer group"
        style={{
          backgroundImage: `url(${item.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Default state (with item title) */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white transition-all duration-300 group-hover:bg-opacity-60">
          <h3 className="text-3xl font-semibold mb-2 text-center">
            {item.title}
          </h3>
        </div>

        {/* Hover state (dark background with "See item" appearing) */}
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center space-x-2 text-sm mt-10">
            <span>See {type}</span>
            <span className="ml-2">»»</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
