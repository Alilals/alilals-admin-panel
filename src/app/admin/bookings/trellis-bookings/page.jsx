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
    key: "Trellis Type",
    value: "trellisType",
  },
  {
    key: "Estimated Cost",
    value: "estimatedCost",
  },
];

const TrellisBookings = () => {
  return (
    <div>
      <PageHeader title="Trellis Bookings" />
      <Table headers={headers} collectionName="TrellisBooking" />
    </div>
  );
};

export default TrellisBookings;
