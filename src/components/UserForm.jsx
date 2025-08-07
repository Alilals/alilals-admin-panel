"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { addUser, updateUser } from "@/lib/firebase-notifications-util";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-notifications-util";

const UserForm = ({
  isEdit = false,
  initialData = null,
  userId = null,
  onCancel = null,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Project Details
    projectId: "",
    nameOfGrower: "",
    parentageOfGrower: "",
    addressOfGrower: "",
    phoneNumber: "",
    plotSize: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        projectId: initialData.projectId || "",
        nameOfGrower: initialData.nameOfGrower || "",
        parentageOfGrower: initialData.parentageOfGrower || "",
        addressOfGrower: initialData.addressOfGrower || "",
        phoneNumber: initialData.phoneNumber || "",
        plotSize: initialData.plotSize || "",
      });
    }
  }, [isEdit, initialData]);

  const checkDuplicateProjectId = async (projectId) => {
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("projectId", "==", projectId)
      );
      const querySnapshot = await getDocs(usersQuery);

      // If editing, exclude the current user from duplicate check
      if (isEdit && userId) {
        return querySnapshot.docs.some((doc) => doc.id !== userId);
      }

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking duplicate project ID:", error);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields (Project Details section)
      const requiredFields = [
        "projectId",
        "nameOfGrower",
        "parentageOfGrower",
        "addressOfGrower",
        "phoneNumber",
        "plotSize",
      ];
      const missingFields = requiredFields.filter(
        (field) => !formData[field].trim()
      );

      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description:
            "Please fill in all required fields in Project Details section.",
          className: "bg-red-500 text-white border border-red-700",
        });
        setLoading(false);
        return;
      }

      // Check for duplicate project ID (only for new users or if project ID changed)
      if (!isEdit || (isEdit && formData.projectId !== initialData.projectId)) {
        const isDuplicate = await checkDuplicateProjectId(formData.projectId);
        if (isDuplicate) {
          toast({
            title: "Duplicate Project ID",
            description:
              "A user with this Project ID already exists. Please use a different Project ID.",
            className: "bg-red-500 text-white border border-red-700",
          });
          setLoading(false);
          return;
        }
      }

      if (isEdit && userId) {
        await updateUser(userId, formData);
        toast({
          title: "Success",
          description: "User updated successfully!",
          className: "bg-green-500 text-white border border-green-700",
        });
      } else {
        await addUser(formData);
        toast({
          title: "Success",
          description: "User created successfully!",
          className: "bg-green-500 text-white border border-green-700",
        });
      }

      router.push("/admin/notifications");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while saving the user.",
        className: "bg-red-500 text-white border border-red-700",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title, fields) => (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ name, label, type = "text", required = false }) => (
          <div key={name} className="space-y-2">
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder={`Enter ${label.toLowerCase()}`}
              required={required}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details */}
        {renderSection("A: Project Details", [
          { name: "projectId", label: "Project ID", required: true },
          { name: "nameOfGrower", label: "Name of Grower", required: true },
          {
            name: "parentageOfGrower",
            label: "Parentage of Grower",
            required: true,
          },
          {
            name: "addressOfGrower",
            label: "Address of Grower",
            required: true,
          },
          {
            name: "phoneNumber",
            label: "Phone Number",
            type: "tel",
            required: true,
          },
          { name: "plotSize", label: "Plot Size", required: true },
        ])}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : isEdit ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
