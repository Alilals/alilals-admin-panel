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
    key: "Land Size",
    value: "totalLand",
  },
  {
    key: "Estimated Cost",
    value: "estimatedCost",
  },
];

const DripBookings = () => {
  return (
    <div>
      <PageHeader title="Drip Irrigation Bookings" />
      <Table headers={headers} collectionName="DripBooking" />
    </div>
  );
};

export default DripBookings;
