"use client";

import React, { useState } from "react";
import AddButton from "@/components/Add-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { useFirestore } from "@/contexts/FirestoreContext";
import { useToast } from "@/hooks/use-toast";

const AddAdmin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const { addData } = useFirestore();
  const { toast } = useToast();

  const AddAdminHandler = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast({
        title: "Please enter both name and email!",
        description: "",
        className: "bg-red-500 text-white border border-red-700",
      });
      return;
    }
    try {
      const result = await addData({ name, email }, "admins");
      setOpen(false);
      toast({
        title: result.message,
        description: "",
        className: `${result.success ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"} text-white border`,
      });
      setEmail("");
      setName("");
    } catch (error) {
      toast({
        title: "Failed to create admin!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      className="bg-green-100 rounded-lg shadow-lg"
    >
      <DialogTrigger>
        <AddButton label="Add Admin" />
      </DialogTrigger>
      <DialogContent className="bg-white rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-green-700 text-2xl font-bold">
            Add Admin
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            You can add a new admin here
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={AddAdminHandler}>
          <Input
            className="my-3"
            placeholder="Enter name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
          />
          <Input
            className="my-3"
            placeholder="Enter email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
          <button
            type="submit"
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Add Admin
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdmin;
