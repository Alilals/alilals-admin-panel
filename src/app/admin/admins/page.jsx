import React from "react";
import PageHeader from "@/components/Page-header";
import AdminTable from "@/components/Admin-table";
import AddAdmin from "@/components/Add-admin";

const AdminPage = () => {
  return (
    <div>
      {/* Page Header */}
      <PageHeader title="Admins" />

      {/* Info and Actions */}
      <div className="my-10 mx-6">
        <div className="font-mono mb-5 flex justify-between items-center bg-green-50 p-5 rounded-lg shadow-md border border-green-100">
          {/* Admin Info */}
          <div className="text-gray-700">
            <div className="text-lg mb-2">
              You can add or remove admins as per your need.
            </div>
            <div className="text-sm">
              <span className="text-red-500 font-bold">Note:</span> It is
              necessary to have at least one admin.
            </div>
          </div>

          {/* Add Admin Button */}
          <div>
            <AddAdmin />
          </div>
        </div>

        {/* Admin Table */}
        <AdminTable />
      </div>
    </div>
  );
};

export default AdminPage;
