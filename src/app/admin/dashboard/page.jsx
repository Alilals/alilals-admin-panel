import React from "react";
import PageHeader from "@/components/Page-header";
import DashboardCards from "@/components/Dashboard-cards";

const Dashboard = () => {
  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="mt-10 mx-6 text-4xl font-bold text-green-700">
        Basic Info
      </div>
      <div className="my-5 mx-6">
        <DashboardCards />
      </div>
    </div>
  );
};

export default Dashboard;
