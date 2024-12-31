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
    key: "Email",
    value: "email",
  },
  {
    key: "Query",
    value: "query",
  },
];

const OrchardBookings = () => {
  return (
    <div>
      <PageHeader title="Query Records" />
      <Table headers={headers} collectionName="QueryBooking" />
    </div>
  );
};

export default OrchardBookings;
