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
    key: "Post Gap",
    value: "postGap",
  },
  {
    key: "Row Gap",
    value: "rowGap",
  },
  {
    key: "Post Type",
    value: "postType",
  },
  {
    key: "Wire Pattern",
    value: "wirePattern",
  },
  {
    key: "Estimated Cost",
    value: "estimatedCost",
  },
];

const OrchardBookings = () => {
  return (
    <div>
      <PageHeader title="Orchard Bookings" />
      <Table headers={headers} collectionName="OrchardBooking" />
    </div>
  );
};

export default OrchardBookings;
