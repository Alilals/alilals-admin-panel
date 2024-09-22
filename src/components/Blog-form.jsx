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

  //generate unique id for image
  const generateUniqueId = () => {
    return uuidv4();
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file,
    });

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
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
    if (blogId) {
      try {
        if (formData.image) {
          const imageId = generateUniqueId();
          const result = await updateData(
            blogId,
            { ...formData, content, imageId },
            "blogs"
          );
          toast({
            title: result.message,
            description: "",
            className: `${result.success ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"} text-white border`,
          });
          if (result.success) {
            router.push("/admin/blogs");
          }
        } else {
          const result = await updateData(
            blogId,
            { ...formData, content },
            "blogs"
          );
          toast({
            title: result.message,
            description: "",
            className: `${result.success ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"} text-white border`,
          });
          if (result.success) {
            router.push("/admin/blogs");
          }
        }
      } catch (error) {
        toast({
          title: "Failed to update the blog!",
          description: error.message,
          className: "bg-red-500 text-white border border-red-700",
        });
      }
    } else {
      try {
        const imageId = generateUniqueId();
        const result = await addData(
          { ...formData, content, imageId },
          "blogs"
        );
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
          title: "Failed to create blog!",
          description: error.message,
          className: "bg-red-500 text-white border border-red-700",
        });
      }
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
  }, [blogId, blogsData]);

  return (
    <div className="max-w-7xl mx-auto p-8 mt-10">
      <div className="flex gap-8">
        {/* Form Section */}
        <div className="w-full bg-purple-50 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
            {blogId ? "Edit Your Blog" : "Create a New Blog"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label
                className="block text-purple-600 font-bold mb-2"
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
                className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Brief Field */}
            <div>
              <label
                className="block text-purple-600 font-bold mb-2"
                htmlFor="brief"
              >
                Brief
              </label>
              <textarea
                name="brief"
                id="brief"
                value={formData.brief}
                onChange={handleChange}
                className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
                placeholder="Enter a brief description of the blog"
                required
              />
            </div>

            {/* Image Upload Field */}
            <div>
              <label
                className="block text-purple-600 font-bold mb-2"
                htmlFor="image"
              >
                Upload Image
              </label>
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-600 hover:file:bg-purple-200"
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-6">
                <p className="text-purple-600 font-bold mb-2">Image Preview:</p>
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
                className="block text-purple-600 font-bold mb-2"
                htmlFor="content"
              >
                Blog Content
              </label>
              <div className="mb-6">
                <ReactQuill
                  theme="snow"
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
                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500"
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
