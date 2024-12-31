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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-green-700">
          Total Records: {totalBookings}
        </h2>
        <button
          onClick={handleDownloadCSV}
          className="font-semibold bg-green-600 text-white hover:bg-green-700 px-2 py-3 mr-5 border border-green-600 rounded-lg"
        >
          Download CSV
        </button>
      </div>

      <div className="overflow-scroll w-full h-[69vh]">
        <table className="min-w-full border-collapse border border-green-300 bg-green-50 text-sm text-gray-700">
          <thead>
            <tr className="bg-green-600 text-white">
              {extendedHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left font-medium border border-green-300"
                >
                  {header.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={extendedHeaders.length}
                  className="px-4 py-3 text-center"
                >
                  Loading...
                </td>
              </tr>
            ) : currentPageData.length > 0 ? (
              currentPageData.map((item, rowIndex) => (
                <tr
                  key={item.id}
                  className="hover:bg-green-100 even:bg-green-50 odd:bg-green-100"
                >
                  {/* Index column */}
                  <td className="px-4 py-3 border border-green-300 text-center">
                    {startIndex + rowIndex + 1}
                  </td>
                  {headers.map((header, index) => (
                    <td
                      key={index}
                      className="px-4 py-3 border border-green-300"
                    >
                      {item[header.value]}
                    </td>
                  ))}
                  {/* Date column */}
                  <td className="px-4 py-3 border border-green-300">
                    {format(new Date(item.createdAt), "dd MMM yyyy: HH:mm")}
                  </td>
                  {/* Checkbox column */}
                  <td className="px-4 py-3 border border-green-300 text-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(event) => handleCheckboxChange(item, event)}
                      className="cursor-pointer"
                    />
                  </td>
                  {/* Actions column with Delete button */}
                  <td className="px-4 py-3 border border-green-300 text-center">
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:text-red-800"
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
                  className="px-4 py-3 text-center"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1 || loading}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === 1 || loading
              ? "bg-green-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
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
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === Math.ceil(totalBookings / itemsPerPage) || loading
              ? "bg-green-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Next
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
              <strong>{selectedRecording?.id}</strong>?
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
