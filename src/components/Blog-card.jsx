"use client";

import React, { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore } from "@/contexts/FirestoreContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BlogCard = ({ blog }) => {
  const { deleteData } = useFirestore();
  const { toast } = useToast();
  const [showPopup, setShowPopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null); // blog to be deleted
  const popupRef = useRef(null); // To reference the popup element
  const buttonRef = useRef(null); // Reference for the 3-dot button
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
    router.push(`blogs/addblog?blogId=${blog.id}`);
  };

  const triggerDelete = (admin) => {
    setSelectedBlog(admin);
    setShowPopup(false);
    setOpen(true);
  };

  const deleteHandler = async () => {
    try {
      const result = await deleteData(selectedBlog.id, "blogs");
      toast({
        title: result.message,
        description: "",
        className: `${result.success ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"} text-white border`,
      });
    } catch (error) {
      toast({
        title: error.message,
        description: "",
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  return (
    <div className="relative bg-purple-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden w-80 transform hover:scale-105">
      {/* Blog Image */}
      <div className="overflow-hidden">
        <img
          src={blog.imageUrl}
          alt={blog.title}
          className="h-40 w-full object-cover"
        />
      </div>
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
            onClick={() => triggerDelete(blog)}
          >
            Delete
          </button>
        </div>
      )}

      {/* AlertDialog for delete confirmation */}
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        className="bg-purple-100 rounded-lg shadow-lg"
      >
        <AlertDialogContent className="bg-white rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-purple-700 text-2xl font-bold">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Do you really want to delete the blog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen(false)}
              className=" hover:bg-purple-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteHandler}
              className="bg-purple-500 hover:bg-purple-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogCard;
