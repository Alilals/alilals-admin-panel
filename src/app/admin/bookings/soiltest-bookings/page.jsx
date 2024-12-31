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
    key: "Crop Type",
    value: "cropType",
  },
  {
    key: "Last Date of Fertilizer (YYYY-MM-DD)",
    value: "lastFertilizerDate",
  },
];

const SoilTestBookings = () => {
  return (
    <div>
      <PageHeader title="Soil Test Bookings" />
      <Table headers={headers} collectionName="SoilTestBooking" />
    </div>
  );
};

export default SoilTestBookings;
