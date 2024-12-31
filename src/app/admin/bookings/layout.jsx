import React from "react";
import { BookingProvider } from "@/contexts/BookingContext";

const BookingLayout = ({ children }) => {
  return <BookingProvider>{children}</BookingProvider>;
};

export default BookingLayout;
