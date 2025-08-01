"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/contexts/BookingContext";

const Table = ({ headers = [], collectionName = "" }) => {
  const { toast } = useToast();
  const {
    fetchTotalBookings,
    bookings,
    loading,
    error,
    fetchBookings,
    editBooking,
    deleteBooking,
    fetchAllBookings,
    totalBookings,
  } = useBookings();

  const itemsPerPage = 10; // Per page bookings
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPageData, setHasNextPageData] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = Array.isArray(bookings)
    ? bookings.slice(startIndex, startIndex + itemsPerPage)
    : [];

  // Pre-fetch next page data
  const prefetchNextPage = async () => {
    if (currentPage < Math.ceil(totalBookings / itemsPerPage)) {
      await fetchBookings(collectionName, itemsPerPage, currentPage + 1);
      setHasNextPageData(true);
    }
  };

  const handlePageChange = async (direction) => {
    if (
      direction === "next" &&
      currentPage < Math.ceil(totalBookings / itemsPerPage)
    ) {
      if (!hasNextPageData) {
        await fetchBookings(collectionName, itemsPerPage, currentPage + 1);
      }
      setCurrentPage((prev) => prev + 1);
      setHasNextPageData(false);
      prefetchNextPage();
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (item, event) => {
    const updatedItem = { ...item, checked: event.target.checked };
    editBooking(collectionName, item.id, updatedItem);
  };

  // Handle delete action
  const handleDelete = async (recording) => {
    setSelectedRecording(recording);
    setOpen(true);
  };

  // Function to handle admin deletion after confirmation
  const confirmDeleteRecord = async () => {
    try {
      await deleteBooking(collectionName, selectedRecording.id);
      toast({
        title: "Record deleted!",
        description: "",
        className: "bg-green-500 text-white border border-green-700",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to delete the record!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  const handleDownloadCSV = async () => {
    try {
      console.log("Downloading CSV...");
      const allBookings = await fetchAllBookings(collectionName);
      if (!allBookings || allBookings.length === 0) {
        toast({
          title: "No records found to download!",
          className: "bg-red-500 text-white border border-red-700",
        });
        return;
      }

      const csvHeaders =
        headers
          .map((header) => header.key)
          .concat("createdAt", "checked")
          .join(",") + "\n";

      // Create the data rows
      const csvRows = allBookings
        .map((booking) => {
          const rowValues = headers.map((header) => {
            const value = booking[header.value];
            // Handle values safely and wrap in quotes if necessary
            return typeof value === "string" && value.includes(",")
              ? `"${value.replace(/"/g, '""')}"`
              : value || "";
          });

          // Add createdAt and checked columns
          const createdAt = format(
            new Date(booking.createdAt),
            "dd MMM yyyy: HH:mm"
          );
          const checked = booking.checked ? "true" : "false";

          // Join all columns for this row
          return [...rowValues, createdAt, checked].join(",");
        })
        .join("\n");

      const csvContent = csvHeaders + csvRows;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${collectionName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "CSV downloaded successfully!",
        className: "bg-green-500 text-white border border-green-700",
      });
    } catch (error) {
      toast({
        title: "Failed to download CSV!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  // Add "Index" column dynamically
  const extendedHeaders = [
    { key: "Index", value: "index" },
    ...headers,
    { key: "Date", value: "createdAt" },
    { key: "Checked", value: "checked" },
    { key: "Actions", value: "actions" },
  ];

  useEffect(() => {
    const initialFetch = async () => {
      if (currentPage === 1 && fetchBookings) {
        await fetchBookings(collectionName, itemsPerPage, 1);
        prefetchNextPage();
      }
    };
    const fetchTotal = async () => {
      await fetchTotalBookings(collectionName);
    };
    fetchTotal();
    initialFetch();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-white shadow rounded-lg">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow rounded-lg">
      {/* Fixed header - no scroll */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-green-700">
          Total Records: {totalBookings}
        </h2>
        <button
          onClick={handleDownloadCSV}
          className="font-semibold bg-green-600 text-white hover:bg-green-700 px-4 py-2 border border-green-600 rounded-lg transition-colors duration-200"
        >
          Download CSV
        </button>
      </div>

      {/* Table section with isolated scroll */}
      <div className="mb-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  {extendedHeaders.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-r border-green-500 last:border-r-0 whitespace-nowrap"
                    >
                      {header.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={extendedHeaders.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : currentPageData.length > 0 ? (
                  currentPageData.map((item, rowIndex) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Index column */}
                      <td className="px-4 py-3 text-sm text-gray-900 text-center border-r border-gray-200 bg-gray-50">
                        <span className="font-medium">
                          {startIndex + rowIndex + 1}
                        </span>
                      </td>
                      {headers.map((header, index) => (
                        <td
                          key={index}
                          className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0"
                        >
                          <div className="max-w-xs">
                            <span className="truncate block">
                              {item[header.value] || "-"}
                            </span>
                          </div>
                        </td>
                      ))}
                      {/* Date column */}
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        <span className="text-gray-600">
                          {format(
                            new Date(item.createdAt),
                            "dd MMM yyyy: HH:mm"
                          )}
                        </span>
                      </td>
                      {/* Checkbox column */}
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 text-center">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(event) =>
                            handleCheckboxChange(item, event)
                          }
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                        />
                      </td>
                      {/* Actions column */}
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        <button
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={extendedHeaders.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        No data available
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          <span className="inline-flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Scroll horizontally to see more columns
          </span>
        </div>
      </div>

      {/* Fixed pagination - no scroll */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1 || loading}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
            currentPage === 1 || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        <span className="text-green-700 font-semibold">
          Page {currentPage} of {Math.ceil(totalBookings / itemsPerPage) || 1}
        </span>

        <button
          onClick={() => handlePageChange("next")}
          disabled={
            currentPage === Math.ceil(totalBookings / itemsPerPage) || loading
          }
          className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
            currentPage === Math.ceil(totalBookings / itemsPerPage) || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Next
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* AlertDialog for delete confirmation */}
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        className="bg-green-100 rounded-lg shadow-lg"
      >
        <AlertDialogContent className="bg-white rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-700 text-2xl font-bold">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Do you really want to remove the record with reference No.{" "}
              <strong>{selectedRecording?.referenceNo}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen(false)}
              className=" hover:bg-green-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRecord}
              className="bg-red-500 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Table;
