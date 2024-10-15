"use client";

import { useFirestore } from "@/contexts/FirestoreContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { v4 as uuidv4 } from "uuid";

const BlogForm = () => {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("blogId");
  const { addData, blogsData, updateData, loading } = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    brief: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [content, setContent] = useState();
  const [imageError, setImageError] = useState("");

  // Generate unique id for image
  const generateUniqueId = () => uuidv4();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check word count for the brief field
    if (name === "brief") {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount > 50) {
        toast({
          title: "Word limit exceeded!",
          description: "Brief cannot exceed 50 words.",
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
    if (!formData.title || !formData.brief || !imagePreview || !content) {
      toast({
        title: "Please fill all the fields",
        description: "",
        className: "bg-red-500 text-white border border-red-700",
      });
      return;
    }

    try {
      const imageId = formData.image ? generateUniqueId() : null;
      const data = { ...formData, content, imageId };

      const result = blogId
        ? await updateData(blogId, data, "blogs")
        : await addData(data, "blogs");

      toast({
        title: result.message,
        description: "",
        className: `${result.success ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"} text-white border`,
      });

      if (result.success) {
        router.push("/admin/blogs");
      }
    } catch (error) {
      toast({
        title: blogId ? "Failed to update the blog!" : "Failed to create blog!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  useEffect(() => {
    if (blogId && blogsData) {
      const blog = blogsData.find((b) => b.id === blogId);

      if (!blog) {
        router.push("/admin/blogs");
        toast({
          title: "Blog not found",
          description: "Blog Id is invalid",
          className: "bg-red-500 text-white border border-red-700",
        });
      }

      if (blog) {
        setFormData({
          title: blog.title,
          brief: blog.brief,
        });
        setContent(blog.content);
        setImagePreview(blog.imageUrl);
      }
    }
  }, [blogId, blogsData, router, toast]);

  return (
    <div className="max-w-7xl mx-auto p-8 mt-10">
      <div className="flex gap-8">
        {/* Form Section */}
        <div className="w-full bg-green-50 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
            {blogId ? "Edit Your Blog" : "Create a New Blog"}
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
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Brief Field */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="brief"
              >
                Brief (Max 50 words)
              </label>
              <textarea
                name="brief"
                id="brief"
                value={formData.brief}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Enter a brief description of the blog"
                required
              />
              <p className="text-sm text-gray-500">
                {formData.brief.trim().split(/\s+/).length} / 50 words
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

            {/* ReactQuill Editor */}
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="content"
              >
                Blog Content
              </label>
              <div className="mb-6">
                <ReactQuill
                  theme="snow"
                  className="bg-white"
                  value={content}
                  onChange={setContent}
                  placeholder="Write your blog content here..."
                  modules={{
                    toolbar: [
                      [{ font: [] }, { size: [] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ color: [] }, { background: [] }],
                      [{ script: "sub" }, { script: "super" }],
                      [
                        { header: "1" },
                        { header: "2" },
                        "blockquote",
                        "code-block",
                      ],
                      [{ list: "ordered" }, { list: "bullet" }, { align: [] }],
                      ["link"],
                      ["clean"],
                    ],
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500"
              >
                {loading
                  ? blogId
                    ? "Updating Blog..."
                    : "Creating Blog..."
                  : blogId
                    ? "Update Blog"
                    : "Create Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;
