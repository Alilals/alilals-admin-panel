"use client";

import React from "react";
import PageHeader from "@/components/Page-header";
import Table from "@/components/Table";

const headers = [
  {
    key: "Reference No",
    value: "referenceNo",
  },
  {
    key: "Name",
    value: "name",
  },
  {
    key: "Address",
    value: "address",
  },
  {
    key: "Phone No",
    value: "phone",
  },
  {
    key: "Expert Type",
    value: "expertType",
  },
];

const SoilTestBookings = () => {
  return (
    <div>
      <PageHeader title="Expert Call Bookings" />
      <Table headers={headers} collectionName="ExpertBooking" />
    </div>
  );
};

export default SoilTestBookings;
