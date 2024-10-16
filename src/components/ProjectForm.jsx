"use client";

import { useFirestore } from "@/contexts/FirestoreContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
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

const ProjectForm = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { addData, projectsData, updateData, deleteData, loading } =
    useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    brief: "",
    image: null,
    name: "",
    address: "",
    cost: "",
    size: "",
    appleType: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [open, setOpen] = useState(false);

  // Generate unique id for image
  const generateUniqueId = () => uuidv4();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check word count for the brief field
    if (name === "brief") {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount > 100) {
        toast({
          title: "Word limit exceeded!",
          description: "Brief cannot exceed 100 words.",
          className: "bg-red-500 text-white border border-red-700",
        });
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image selection with size check
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError("");

    if (file) {
      if (file.size > 1024 * 1024) {
        setImageError("Image size exceeds 1MB. Please upload a smaller file.");
        setImagePreview(null);
        setFormData({
          ...formData,
          image: null,
        });
        return;
      }

      setFormData({
        ...formData,
        image: file,
      });

      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.brief ||
      !imagePreview ||
      !formData.name ||
      !formData.address ||
      !formData.cost ||
      !formData.size ||
      !formData.appleType
    ) {
      toast({
        title: "Please fill all the fields",
        description: "",
        className: "bg-red-500 text-white border border-red-700",
      });
      return;
    }

    try {
      const imageId = formData.image ? generateUniqueId() : null;
      const data = { ...formData, imageId };

      const result = projectId
        ? await updateData(projectId, data, "projects")
        : await addData(data, "projects");

      toast({
        title: result.message,
        description: "",
        className: `${result.success ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"} text-white border`,
      });

      if (result.success) {
        router.push("/admin/projects");
      }
    } catch (error) {
      toast({
        title: projectId
          ? "Failed to update the project!"
          : "Failed to create project!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  const deleteHandler = async () => {
    try {
      const result = await deleteData(projectId, "projects");
      if (result.success) {
        router.push("/admin/projects");
      }
      toast({
        title: result.message,
        description: "",
        className: `${result.success ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"} text-white border`,
      });
    } catch (error) {
      toast({
        title: error.message,
        description: "",
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  useEffect(() => {
    if (projectId && projectsData.length) {
      const project = projectsData.find((p) => p.id === projectId);

      if (!project) {
        router.push("/admin/projects");
        toast({
          title: "Project not found",
          description: "Project Id is invalid",
          className: "bg-red-500 text-white border border-red-700",
        });
      }

      if (project) {
        setFormData({
          title: project.title,
          brief: project.brief,
          name: project.name,
          address: project.address,
          cost: project.cost,
          size: project.size,
          appleType: project.appleType,
        });
        setImagePreview(project.imageUrl);
      }
    }
  }, [projectId, projectsData, router, toast]);

  return (
    <div className="max-w-7xl mx-auto p-8 mt-10 relative">
      <div className="flex gap-8">
        {/* Form Section */}
        <div className="w-full bg-green-50 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
            {projectId ? "Edit Your Project" : "Create a New Project"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="title"
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter project title"
                required
              />
            </div>

            {/* Brief Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="brief"
              >
                Brief (Max 100 words)
              </label>
              <textarea
                name="brief"
                id="brief"
                value={formData.brief}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Enter a brief description of the project"
                required
              />
              <p className="text-sm text-gray-500">
                {formData.brief.trim().split(/\s+/).length} / 100 words
              </p>
            </div>

            {/* Image Upload Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="image"
              >
                Upload Image (Max size: 1MB)
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-600 hover:file:bg-green-200"
              />
              {imageError && (
                <p className="text-red-500 text-sm mt-2">{imageError}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Maximum image size: 1MB.
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-6">
                <p className="text-green-600 font-bold mb-2">Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Selected Preview"
                  className="w-full h-72 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Grover Name Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="name"
              >
                Grover Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter grover name"
                required
              />
            </div>

            {/* Grover Address Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="title"
              >
                Grover Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter grover address"
                required
              />
            </div>

            {/* Project Cost Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="cost"
              >
                Project Cost
              </label>
              <input
                type="number"
                name="cost"
                id="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter project cost"
                required
              />
            </div>

            {/* Project Size Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="size"
              >
                Project Size (In Kanals)
              </label>
              <input
                type="number"
                name="size"
                id="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter project size"
                required
              />
            </div>

            {/* Apple Type Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="appleType"
              >
                Type of Apple
              </label>
              <input
                type="text"
                name="appleType"
                id="appleType"
                value={formData.appleType}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter type of apple"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500"
              >
                {loading
                  ? projectId
                    ? "Updating Project..."
                    : "Creating Project..."
                  : projectId
                    ? "Update Project"
                    : "Create Project"}
              </button>
              {/* Delete Button */}
              {projectId && (
                <div className="">
                  <button
                    onClick={() => {
                      setOpen(true);
                    }}
                    type="button"
                    className="px-6 py-3 ml-5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete Project
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

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
              Do you really want to delete the project.
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
              onClick={deleteHandler}
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

export default ProjectForm;
