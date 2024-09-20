import React from "react";
import PageHeader from "@/components/Page-header";
import DashboardCards from "@/components/Dashboard-cards";
import { Newspaper } from "lucide-react";

const Page = () => {
  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="my-10 mx-6 flex gap-8 flex-wrap">
        <DashboardCards title="Blogs" count="10" icon={Newspaper} />
      </div>
    </div>
  );
};

export default Page;
