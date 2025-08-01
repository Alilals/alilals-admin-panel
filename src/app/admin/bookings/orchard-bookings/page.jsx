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
    key: "Side Anchors",
    value: "sideAnchors",
  },
  {
    key: "Cross Wire",
    value: "crossWire",
  },
  {
    key: "Post Caps",
    value: "postCaps",
  },
  {
    key: "Top Wire Hail Net",
    value: "topWireHailNet",
  },
  {
    key: "Header Assembly",
    value: "headerAssembly",
  },
  {
    key: "Ventury Injector",
    value: "venturyInjector",
  },
  {
    key: "Hydrocyclone Filter",
    value: "hydrocycloneFilter",
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
