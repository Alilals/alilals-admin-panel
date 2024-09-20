import React from "react";
import PageHeader from "@/components/Page-header";
import SearchField from "@/components/Search-field";
import AddButton from "@/components/Add-button";
import BlogCard from "@/components/Blog-card";
import Link from "next/link";
import blogs from "@/data/blogs.json";

const page = () => {
  return (
    <div>
      <PageHeader title="Blogs" />
      <div className="my-10 flex justify-center gap-10">
        <SearchField placeholder="Search blog..." />
        <Link href="/blogs/addblog">
          <AddButton label="Add Blog" />
        </Link>
      </div>
      <div className="flex mx-6 gap-6 flex-wrap my-10">
        {blogs &&
          blogs.map((blog) => {
            return <BlogCard blog={blog} />;
          })}
        {!blogs && (
          <div className="text-3xl font-bold text-purple-200 mt-20">
            No blogs added yet...
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
