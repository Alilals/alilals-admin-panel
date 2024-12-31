import PageHeader from "@/components/Page-header";
import Link from "next/link";
import React from "react";

const records = [
  { name: "Query Records", link: "bookings/query-bookings" },
  { name: "Orchard Booking Records", link: "bookings/orchard-bookings" },
  { name: "Trellis Booking Records", link: "bookings/trellis-bookings" },
  { name: "Drip Irrigation Booking Records", link: "bookings/drip-bookings" },
  { name: "Soil Test Booking Records", link: "bookings/soiltest-bookings" },
  { name: "Expert Call Booking Records", link: "bookings/expert-bookings" },
];

const BookingPage = () => {
  return (
    <div>
      <PageHeader title={"Booking Records"} />
      <table className=" my-10 w-3/4 mx-auto bg-green-50 shadow-lg rounded-lg">
        <thead>
          <tr className="bg-green-600 text-white">
            <th className="px-6 py-4 text-left font-semibold">Record Name</th>
            <th className="px-6 py-4 text-left font-semibold">Link</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr
              key={index}
              className="border-b hover:bg-green-100 transition-colors"
            >
              <td className="px-6 py-4">{record.name}</td>
              <td className="px-6 py-4">
                <Link
                  href={record.link}
                  className="text-green-600 hover:text-green-700 font-medium underline"
                >
                  View Record
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingPage;
