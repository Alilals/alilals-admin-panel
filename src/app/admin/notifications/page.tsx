"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/Page-header";
import AddButton from "@/components/Add-button";
import Link from "next/link";

import { Search, Eye } from "lucide-react";
import { getUsersByPage } from "@/lib/firebase-notifications-util";

const NotificationsPage = () => {
  const usersPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from Firestore with pagination
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getUsersByPage(page, usersPerPage);
      setUsers(result.users);
      setTotalUsers(result.totalUsers);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setFilteredUsers([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Use improved search function from utils
        const { searchUsers } = await import(
          "@/lib/firebase-notifications-util"
        );
        const results = await searchUsers(searchTerm);
        setFilteredUsers(results);
      } catch (error) {
        console.error("Search error:", error);
        setFilteredUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Reset current page when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      setCurrentPage(1);
    } else {
      fetchUsers(1);
    }
  }, [searchTerm]);

  // Determine which users to display
  const displayUsers = searchTerm.trim() ? filteredUsers : users;

  // Calculate pagination for current display
  const currentUsers = searchTerm.trim()
    ? displayUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
      )
    : displayUsers;

  // Change page handler
  const handlePageChange = (page) => {
    if (searchTerm.trim()) {
      // For search results, use client-side pagination
      setCurrentPage(page);
    } else {
      // For regular data, fetch from server
      fetchUsers(page);
    }
  };

  return (
    <div>
      <PageHeader title="User Management" />
      <div className="my-10 flex justify-center gap-10">
        {/* Search Box */}
        <div className="flex items-center bg-green-100 text-green-700 rounded-lg shadow-md p-3 w-full max-w-md">
          <Search className="text-green-500 w-5 h-5 mr-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Project ID or Name"
            className="bg-transparent flex-grow outline-none text-green-700 placeholder-green-500"
          />
        </div>
        {/* Add User Button */}
        <Link href="/admin/notifications/add">
          <AddButton label="Add User" onClick={() => {}} />
        </Link>
      </div>

      {/* Users Table */}
      {loading || isSearching ? (
        <div className="flex justify-center items-center mt-20">
          <div className="w-12 h-12 border-4 border-green-400 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center mt-20">
          <div className="text-red-500 text-xl">
            Error loading users: {error}
          </div>
        </div>
      ) : (
        <div className="mx-6 my-10">
          {/* Total Count */}
          {!searchTerm.trim() && (
            <div className="mb-4 text-sm text-gray-600">
              Total Users:{" "}
              <span className="font-semibold text-green-600">{totalUsers}</span>
            </div>
          )}

          {currentUsers.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-700 uppercase tracking-wider">
                        Project ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-700 uppercase tracking-wider">
                        Name of Grower
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-700 uppercase tracking-wider">
                        Parentage
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-700 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-700 uppercase tracking-wider">
                        Plot Size
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-green-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.projectId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.nameOfGrower}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.parentageOfGrower}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.plotSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/notifications/${user.projectId}`}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="w-full text-center text-3xl font-bold text-green-200 mt-20">
              {searchTerm.trim()
                ? "No users found matching your search..."
                : "No users found..."}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {(() => {
        const paginationTotalPages = searchTerm.trim()
          ? Math.ceil(filteredUsers.length / usersPerPage)
          : totalPages;

        return (
          paginationTotalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed text-gray-400"
                      : "text-green-600 hover:bg-green-100"
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {(() => {
                  const maxVisiblePages = 5;
                  const startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisiblePages / 2)
                  );
                  const endPage = Math.min(
                    paginationTotalPages,
                    startPage + maxVisiblePages - 1
                  );
                  const adjustedStartPage = Math.max(
                    1,
                    endPage - maxVisiblePages + 1
                  );

                  return Array.from(
                    { length: endPage - adjustedStartPage + 1 },
                    (_, index) => {
                      const page = adjustedStartPage + index;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            page === currentPage
                              ? "bg-green-100 text-green-600 border border-green-300"
                              : "text-gray-500 hover:bg-green-100 hover:text-green-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  );
                })()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginationTotalPages}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === paginationTotalPages
                      ? "opacity-50 cursor-not-allowed text-gray-400"
                      : "text-green-600 hover:bg-green-100"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )
        );
      })()}
    </div>
  );
};

export default NotificationsPage;
