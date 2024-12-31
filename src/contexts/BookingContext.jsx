"use client";

import React, { createContext, useContext, useState } from "react";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  query,
  limit,
  updateDoc,
  orderBy,
  startAfter,
  getCountFromServer,
  deleteDoc,
  where,
} from "firebase/firestore";
import { UserApp } from "../../firebase";

const firestore = getFirestore(UserApp);
const BookingContext = createContext();
export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisibleDocs, setLastVisibleDocs] = useState({}); // Store lastVisible docs for each page
  const [totalBookings, setTotalBookings] = useState(0);

  const fetchTotalBookings = async (collectionName) => {
    try {
      console.log("Fetching total bookings count...");
      const bookingsRef = collection(firestore, collectionName);
      const snapshot = await getCountFromServer(bookingsRef);
      const count = snapshot.data().count;
      setTotalBookings(count);
      return count;
    } catch (error) {
      console.error("Error fetching total bookings count:", error);
      setError("Failed to fetch total bookings count");
      return 0;
    }
  };

  // Fetch bookings based on page number
  const fetchBookings = async (collectionName, limitSize, pageNo) => {
    try {
      setLoading(true);
      setError(null);
      const bookingsRef = collection(firestore, collectionName);

      // Reset everything if it's first page
      if (pageNo === 1) {
        setBookings([]);
        setLastVisibleDocs({});
      }

      let bookingsQuery;
      const prevPageNo = pageNo - 1;

      if (pageNo === 1) {
        // First page query
        bookingsQuery = query(
          bookingsRef,
          orderBy("createdAt", "desc"),
          limit(limitSize)
        );
      } else if (lastVisibleDocs[prevPageNo]) {
        // Use the lastVisible doc from the previous page
        bookingsQuery = query(
          bookingsRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisibleDocs[prevPageNo]),
          limit(limitSize)
        );
      } else {
        throw new Error("Previous page data not found");
      }

      console.log("Fetching bookings for page:", pageNo);
      const snapshot = await getDocs(bookingsQuery);

      if (snapshot.empty) {
        setLoading(false);
        return [];
      }

      // Store the last document for this page
      if (snapshot.docs.length > 0) {
        setLastVisibleDocs((prev) => ({
          ...prev,
          [pageNo]: snapshot.docs[snapshot.docs.length - 1],
        }));
      }

      const fetchedBookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update bookings based on page number
      setBookings((prevBookings) => {
        if (pageNo === 1) return fetchedBookings;

        // For subsequent pages, append the new bookings
        const uniqueBookings = [...prevBookings];
        fetchedBookings.forEach((newBooking) => {
          if (!uniqueBookings.some((booking) => booking.id === newBooking.id)) {
            uniqueBookings.push(newBooking);
          }
        });
        return uniqueBookings;
      });
      console.log("All bookings:", bookings);
      return fetchedBookings;
    } catch (error) {
      console.error("Error fetching records:", error);
      setError("Failed to fetch records");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // update a booking document
  const editBooking = async (collectionName, bookingId, updatedData) => {
    try {
      setError(null);
      setLoading(true);
      const bookingRef = doc(firestore, collectionName, bookingId);

      await updateDoc(bookingRef, updatedData);

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, ...updatedData } : booking
        )
      );
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error updating record:", error);
      setLoading(false);
      setError("Failed to update record");
      return false;
    }
  };

  // Function to delete a booking document
  const deleteBooking = async (collectionName, bookingId) => {
    try {
      setError(null);
      setLoading(true);
      const bookingRef = doc(firestore, collectionName, bookingId);
      await deleteDoc(bookingRef);

      // Update the bookings array by removing the deleted booking
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== bookingId)
      );
      setTotalBookings((prev) => prev - 1);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error deleting booking:", error);
      setLoading(false);
      setError("Failed to delete booking");
      return false;
    }
  };

  // Function to fetch all bookings in a collection
  const fetchAllBookings = async (collectionName) => {
    try {
      setError(null);
      const bookingsRef = collection(firestore, collectionName);
      console.log("Fetching all records...");
      const snapshot = await getDocs(bookingsRef);

      if (snapshot.empty) {
        return [];
      }

      const allBookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return allBookings;
    } catch (error) {
      console.error("Error fetching all records:", error);
      setError("Failed to fetch all records");
      return [];
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        fetchBookings,
        editBooking,
        deleteBooking,
        fetchTotalBookings,
        fetchAllBookings,
        totalBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
};
