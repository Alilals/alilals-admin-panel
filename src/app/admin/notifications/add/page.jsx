import PageHeader from "@/components/Page-header";
import UserForm from "@/components/UserForm";
import React from "react";

const AddUser = () => {
  return (
    <div>
      <PageHeader title="Add New User" />
      <UserForm />
    </div>
  );
};

export default AddUser;
