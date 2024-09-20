"use client";

import React, { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

const BlogCard = ({ blog }) => {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null); // To reference the popup element
  const buttonRef = useRef(null); // Reference for the 2-dot button
  const router = useRouter(); // For navigating to blog details

  const togglePopup = (event) => {
    event.stopPropagation(); // Prevents the event from bubbling up
    setShowPopup(!showPopup); // Toggle the popup visibility
  };

  // Close the popup when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target) // Exclude button clicks
      ) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  // Navigate to the edit blog page
  const handleEdit = () => {
    router.push(`/blogs/${blog.id}`);
  };

  return (
    <div className="relative bg-purple-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-80">
      {/* Blog Image */}
      <img
        src={blog.image}
        alt={blog.title}
        className="h-40 w-full object-cover"
      />
      {/* Blog Content */}
      <div className="p-5">
        <h2 className="text-2xl font-bold text-purple-600 mb-2">
          {blog.title}
        </h2>
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{blog.brief}</p>
        {/* Uploader and Date */}
        <div className="text-xs text-gray-500 mb-4">
          <span>Uploaded by: {blog.uploader}</span>
          <br />
          <span>{blog.date}</span>
        </div>
      </div>
      {/* More Options Button */}
      <button
        ref={buttonRef}
        className="absolute top-4 right-4 bg-purple-200 p-2 rounded-full hover:bg-purple-300 transition-colors"
        onClick={togglePopup}
      >
        <MoreVertical className="text-purple-600" />
      </button>
      {/* Edit/Delete Popup */}
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute top-12 right-4 bg-white border border-gray-200 shadow-lg rounded-lg py-2 w-32 z-10"
        >
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setShowPopup(false)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogCard;
