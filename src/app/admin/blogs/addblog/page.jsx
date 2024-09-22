import BlogForm from "@/components/Blog-form";
import PageHeader from "@/components/Page-header";
import React from "react";

const page = () => {
  return (
    <div>
      <PageHeader title="Create Blog" />
      <BlogForm />
    </div>
  );
};

export default page;
