"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/Page-header";
import AddButton from "@/components/Add-button";
import BlogCard from "@/components/Blog-card";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useFirestore } from "@/contexts/FirestoreContext";
import { Search } from "lucide-react";

const BlogsPage = () => {
  const { blogsData, loading } = useFirestore();

  const blogsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter blogs by search term, real-time as searchTerm changes
  const filteredBlogs = blogsData?.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total pages based on filtered blogs
  const totalPages = Math.ceil(filteredBlogs?.length / blogsPerPage);

  // Get blogs for the current page
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs?.slice(indexOfFirstBlog, indexOfLastBlog);

  // Change page handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to the first page when search term changes
  }, [searchTerm]);

  return (
    <div>
      <PageHeader title="Blogs" />
      <div className="my-10 flex justify-center gap-10">
        <div className="flex items-center bg-purple-100 text-purple-700 rounded-lg shadow-md p-3 w-full max-w-md">
          <Search className="text-purple-500 w-5 h-5 mr-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your blogs..."
            className="bg-transparent flex-grow outline-none text-purple-700 placeholder-purple-400"
          />
        </div>
        <Link href="/admin/blogs/addblog">
          <AddButton label="Add Blog" />
        </Link>
      </div>

      {/* Blog Cards */}
      {loading ? (
        <div className="flex justify-center text-3xl text-purple-200 mt-20">
          Loading...
        </div>
      ) : (
        <div className="flex mx-6 gap-6 flex-wrap my-10">
          {currentBlogs?.length > 0 ? (
            currentBlogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
          ) : (
            <div className="w-full text-center text-3xl font-bold text-purple-200 mt-20">
              No blogs found...
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationPrevious
              className={`${
                currentPage === 1
                  ? "opacity-50 pointer-events-none"
                  : "hover:text-purple-600"
              } text-purple-600`}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </PaginationPrevious>

            <PaginationContent>
              {Array.from({ length: totalPages }, (_, index) => (
                <PaginationItem
                  key={index}
                  active={index + 1 === currentPage}
                  className={`${
                    index + 1 === currentPage
                      ? "bg-purple-100 text-purple-600"
                      : "hover:bg-purple-100 hover:text-purple-600"
                  }`}
                >
                  <PaginationLink onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>

            <PaginationNext
              className={`${
                currentPage === totalPages
                  ? "opacity-50 pointer-events-none"
                  : "hover:text-purple-600"
              } text-purple-600`}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </PaginationNext>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
