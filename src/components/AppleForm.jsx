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

const AppleVarietyForm = () => {
  const searchParams = useSearchParams();
  const appleId = searchParams.get("appleId");
  const { addData, applesData, updateData, deleteData, loading } =
    useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Fruit Info
    title: "",
    characteristics: "",
    image: null,
    colour: "",
    flavour: "",
    shape: "",
    skin: "",
    fruitFlesh: "",

    // Tree Info
    vigour: "",
    blossom: "",
    pollinator: "",

    // Performance/Elevation
    growth: "",
    maturity: "",
    size: "",

    // Company Experience
    companyExp: "",

    // PDF File
    pdfFile: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [imageError, setImageError] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [open, setOpen] = useState(false);

  // Generate unique id for image/pdf
  const generateUniqueId = () => uuidv4();

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check word count for characteristics and experience fields
    if (name === "characteristics" || name === "companyExp") {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount > 50) {
        toast({
          title: "Word limit exceeded!",
          description: "Text cannot exceed 50 words.",
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

  // Handle image selection
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

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle PDF selection
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    setPdfError("");

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPdfError("PDF size exceeds 5MB. Please upload a smaller file.");
        setPdfName("");
        setFormData({
          ...formData,
          pdfFile: null,
        });
        return;
      }

      setFormData({
        ...formData,
        pdfFile: file,
      });
      setPdfName(file.name);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (
      !formData.title ||
      !formData.characteristics ||
      !imagePreview ||
      !pdfName ||
      !formData.colour ||
      !formData.flavour ||
      !formData.skin ||
      !formData.blossom ||
      !formData.companyExp ||
      !formData.fruitFlesh ||
      !formData.growth ||
      !formData.maturity ||
      !formData.pollinator ||
      !formData.shape ||
      !formData.vigour ||
      !formData.size
    ) {
      toast({
        title: "Please fill all the fields",
        description:
          "Please fill all required fields and upload necessary files.",
        className: "bg-red-500 text-white border border-red-700",
      });
      return;
    }

    try {
      const imageId = formData.image ? generateUniqueId() : null;
      const pdfId = formData.pdfFile ? generateUniqueId() : null;
      const data = { ...formData, imageId, pdfId, pdfName };

      const result = appleId
        ? await updateData(appleId, data, "apples")
        : await addData(data, "apples");

      toast({
        title: result.message,
        description: "",
        className: `${result.success ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"} text-white border`,
      });

      if (result.success) {
        router.push("/admin/apples");
      }
    } catch (error) {
      toast({
        title: "Failed to save apple variety!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  const deleteHandler = async () => {
    try {
      const result = await deleteData(appleId, "apples");
      if (result.success) {
        router.push("/admin/apples");
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
    if (appleId && applesData.length) {
      const apple = applesData.find((a) => a.id === appleId);

      if (!apple) {
        router.push("/admin/apples");
        toast({
          title: "Apple Variety not found",
          description: "Apple Id is invalid",
          className: "bg-red-500 text-white border border-red-700",
        });
      }

      if (apple) {
        setFormData({
          title: apple.title,
          characteristics: apple.characteristics,
          colour: apple.colour,
          flavour: apple.flavour,
          shape: apple.shape,
          skin: apple.skin,
          fruitFlesh: apple.fruitFlesh,
          vigour: apple.vigour,
          blossom: apple.blossom,
          pollinator: apple.pollinator,
          growth: apple.growth,
          maturity: apple.maturity,
          size: apple.size,
          companyExp: apple.companyExp,
        });
        setImagePreview(apple.imageUrl);
        setPdfName(apple.pdfName);
      }
    }
  }, [appleId, applesData, router, toast]);

  return (
    <div className="max-w-7xl mx-auto p-8 mt-10">
      <div className="bg-green-50 p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          {appleId ? "Edit Apple Variety" : "Add New Apple Variety"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Fruit Info Section */}
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-600 mb-4">
              1. Fruit Information
            </h3>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Characteristics */}
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="characteristics"
                >
                  Characteristics (Max 50 words)
                </label>
                <textarea
                  name="characteristics"
                  id="characteristics"
                  value={formData.characteristics}
                  onChange={handleChange}
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.characteristics.trim().split(/\s+/).length} / 50
                  words
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="image"
                >
                  Image (Max: 1MB)
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
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-4 w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Other Fruit Characteristics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-green-600 font-bold mb-2"
                    htmlFor="colour"
                  >
                    Colour
                  </label>
                  <input
                    type="text"
                    name="colour"
                    id="colour"
                    value={formData.colour}
                    onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label
                    className="block text-green-600 font-bold mb-2"
                    htmlFor="flavour"
                  >
                    Flavour
                  </label>
                  <input
                    type="text"
                    name="flavour"
                    id="flavour"
                    value={formData.flavour}
                    onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label
                    className="block text-green-600 font-bold mb-2"
                    htmlFor="shape"
                  >
                    Shape/Size
                  </label>
                  <input
                    type="text"
                    name="shape"
                    id="shape"
                    value={formData.shape}
                    onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label
                    className="block text-green-600 font-bold mb-2"
                    htmlFor="skin"
                  >
                    Skin
                  </label>
                  <input
                    type="text"
                    name="skin"
                    id="skin"
                    value={formData.skin}
                    onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label
                    className="block text-green-600 font-bold mb-2"
                    htmlFor="fruitFlesh"
                  >
                    Fruit Flesh
                  </label>
                  <input
                    type="text"
                    name="fruitFlesh"
                    id="fruitFlesh"
                    value={formData.fruitFlesh}
                    onChange={handleChange}
                    className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tree Info Section */}
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-600 mb-4">
              2. Tree Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="vigour"
                >
                  Vigour
                </label>
                <input
                  type="text"
                  name="vigour"
                  id="vigour"
                  value={formData.vigour}
                  onChange={handleChange}
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="blossom"
                >
                  Blossom
                </label>
                <input
                  type="text"
                  name="blossom"
                  id="blossom"
                  value={formData.blossom}
                  onChange={handleChange}
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="pollinator"
                >
                  Pollinator
                </label>
                <input
                  type="text"
                  name="pollinator"
                  id="pollinator"
                  value={formData.pollinator}
                  onChange={handleChange}
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Performance/Elevation Section */}
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-600 mb-4">
              3. Performance & Elevation
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="growth"
                >
                  Growth/Vigour
                </label>
                <input
                  type="text"
                  name="growth"
                  id="growth"
                  value={formData.growth}
                  onChange={handleChange}
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="maturity"
                >
                  Maturity
                </label>
                <input
                  type="text"
                  name="maturity"
                  id="maturity"
                  value={formData.maturity}
                  onChange={handleChange}
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  className="block text-green-600 font-bold mb-2"
                  htmlFor="size"
                >
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  id="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Company Experience Section */}
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-600 mb-4">
              4. Company Experience
            </h3>
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="experience"
              >
                Experience (Max 50 words)
              </label>
              <textarea
                name="companyExp"
                id="companyExp"
                value={formData.companyExp}
                onChange={handleChange}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
              />
              <p className="text-sm text-gray-500">
                {formData.companyExp.trim().split(/\s+/).length} / 50 words
              </p>
            </div>
          </div>

          {/* PDF Upload Section */}
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold text-green-600 mb-4">
              5. Maturity Calendar
            </h3>
            <div>
              <label
                className="block text-green-600 font-bold mb-2"
                htmlFor="pdfFile"
              >
                Upload PDF (Max: 5MB)
              </label>
              <input
                type="file"
                name="pdfFile"
                id="pdfFile"
                accept=".pdf"
                onChange={handlePdfChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-600 hover:file:bg-green-200"
              />
              {pdfError && (
                <p className="text-red-500 text-sm mt-2">{pdfError}</p>
              )}
              {pdfName && (
                <p className="text-sm text-green-600 mt-2">
                  Selected file: {pdfName}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center text-center">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500"
            >
              {loading
                ? appleId
                  ? "Updating Variety..."
                  : "Creating Variety..."
                : appleId
                  ? "Update Variety"
                  : "Create Variety"}
            </button>
            {/* Delete Button */}
            {appleId && (
              <div className="">
                <button
                  onClick={() => {
                    setOpen(true);
                  }}
                  type="button"
                  className="px-6 py-3 ml-5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Variety
                </button>
              </div>
            )}
          </div>
        </form>
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
              Do you really want to delete this Apple Variety.
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

export default AppleVarietyForm;
