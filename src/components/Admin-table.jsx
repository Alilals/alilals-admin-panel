"use client";

import React, { useState } from "react";
import { XCircle } from "lucide-react";
import { useFirestore } from "@/contexts/FirestoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminTable = () => {
  const [open, setOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null); // Admin to be deleted
  const { adminsData, deleteData } = useFirestore();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Function to handle admin deletion after confirmation
  const confirmDeleteAdmin = async () => {
    if (selectedAdmin.email === currentUser.email) {
      toast({
        title: "You're currently logged in with this admin, cannot remove",
        description: "",
        className: "bg-red-500 text-white border border-red-700",
      });
      return;
    }
    try {
      await deleteData(selectedAdmin.id, "admins");
      toast({
        title: "Admin removed!",
        description: "",
        className: "bg-green-500 text-white border border-green-700",
      });
      setOpen(false); // Close the dialog after deletion
    } catch (error) {
      toast({
        title: "Failed to delete admin!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  // Function to trigger the dialog and store the selected admin
  const triggerDelete = (admin) => {
    setSelectedAdmin(admin); // Set the admin to be deleted
    setOpen(true); // Open the dialog
  };

  return (
    <div className="overflow-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="py-3 px-5 text-left">Name</th>
            <th className="py-3 px-5 text-left">Email</th>
            <th className="py-3 px-5 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {adminsData &&
            adminsData.map((admin) => (
              <tr
                key={admin.id}
                className={`border-t border-gray-200 transition-colors ${
                  admin.email === currentUser.email
                    ? "bg-green-100 hover:bg-green-200"
                    : "hover:bg-green-50"
                }`}
              >
                <td className="py-3 px-5 flex items-center">
                  {admin.name}
                  {admin.email === currentUser.email && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full ml-2">
                      Current Admin
                    </span>
                  )}
                </td>
                <td className="py-3 px-5">{admin.email}</td>
                <td className="py-3 px-5">
                  <button
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => triggerDelete(admin)} // Trigger delete dialog
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* AlertDialog for delete confirmation */}
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        className="bg-green-100 rounded-lg shadow-lg"
      >
        <AlertDialogContent className="bg-white rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-700 text-2xl font-bold">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Do you really want to remove the admin{" "}
              <strong>{selectedAdmin?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen(false)}
              className=" hover:bg-green-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAdmin}
              className="bg-green-500 hover:bg-green-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTable;
