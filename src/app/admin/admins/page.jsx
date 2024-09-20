import React from "react";
import PageHeader from "@/components/Page-header";
import AdminTable from "@/components/Admin-table";
import AddAdmin from "@/components/Add-admin";

const page = () => {
  return (
    <div>
      <PageHeader title="Admins" />
      <div className="my-10 mx-6">
        <div className="font-mono mb-3 flex justify-between">
          <div>
            <div>You can add or remove admins as per you need.</div>
            <div>
              <span className="text-red-500 font-bold">Note:</span> It is
              necessary to have ateast one admin.
            </div>
          </div>
          <AddAdmin />
        </div>
        <AdminTable />
      </div>
    </div>
  );
};

export default page;
