"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/Page-header";
import UserForm from "@/components/UserForm";
import { deleteUser } from "@/lib/firebase-notifications-util";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-notifications-util";
import { Edit, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { projectId } = params;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Find user by projectId
        const usersQuery = query(
          collection(db, "users"),
          where("projectId", "==", projectId)
        );

        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setUser({ id: userDoc.id, ...userDoc.data() });
        } else {
          toast({
            title: "Error",
            description: "User not found.",
            variant: "destructive",
          });
          router.push("/admin/notifications");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchUser();
    }
  }, [projectId, router, toast]);

  const handleDelete = async () => {
    try {
      await deleteUser(user.id);
      toast({
        title: "Success",
        description: "User deleted successfully!",
      });
      router.push("/admin/notifications");
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const renderSection = (title, fields, data) => (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {data[key] || "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="w-12 h-12 border-4 border-green-400 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="text-gray-500 text-xl">User not found</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <PageHeader title={`Edit User - ${user.projectId}`} />
        <UserForm
          isEdit={true}
          initialData={user}
          userId={user.id}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`User Details - ${user.projectId}`} />

      <div className="max-w-6xl mx-auto p-6">
        {/* Project Details */}
        {renderSection(
          "A: Project Details",
          [
            { key: "projectId", label: "Project ID" },
            { key: "nameOfGrower", label: "Name of Grower" },
            { key: "parentageOfGrower", label: "Parentage of Grower" },
            { key: "addressOfGrower", label: "Address of Grower" },
            { key: "phoneNumber", label: "Phone Number" },
            { key: "plotSize", label: "Plot Size" },
          ],
          user
        )}

        {/* Soil Health Status */}
        {renderSection(
          "B: Soil Health Status",
          [
            {
              key: "soilSampleCollectionDate",
              label: "Soil Sample Collection Date",
            },
            { key: "soilTestingDate", label: "Soil Testing Date" },
            { key: "soilHealthStatus", label: "Soil Health Status" },
            { key: "recommendations", label: "Recommendations" },
          ],
          user
        )}

        {/* Site Plan & Layout Status */}
        {renderSection(
          "C: Site Plan & Layout Status",
          [
            { key: "layoutDateInitiation", label: "Layout Date - Initiation" },
            { key: "layoutDateCompletion", label: "Layout Date - Completion" },
          ],
          user
        )}

        {/* Project Cost Estimation */}
        {renderSection(
          "D: Project Cost Estimation",
          [
            {
              key: "siteAreaInTrellisKanals",
              label: "Site Area in Trellis Kanals",
            },
            { key: "initialEstimateAmount", label: "Initial Estimate Amount" },
          ],
          user
        )}

        {/* Trellis & Irrigation Installation */}
        {renderSection(
          "E: Trellis & Irrigation Installation",
          [
            { key: "installationDate", label: "Installation Date" },
            { key: "completionDate", label: "Completion Date" },
          ],
          user
        )}

        {/* Booking Status */}
        {renderSection(
          "F: Booking Status",
          [
            { key: "bookingDate", label: "Booking Date" },
            { key: "bookingAmount", label: "Booking Amount" },
            { key: "bookingSerialNo", label: "Booking Serial No." },
          ],
          user
        )}

        {/* Payment Status */}
        {renderSection(
          "G: Payment Status",
          [
            {
              key: "firstInstallmentAmount",
              label: "First Installment Amount (Plant Confirmation)",
            },
            {
              key: "firstInstallmentDueDate",
              label: "First Installment Due Date",
            },
            {
              key: "estimatedDateOfPlantation",
              label: "Estimated Date of Plantation",
            },
            {
              key: "secondInstallmentAmount",
              label: "Second Installment Amount",
            },
            {
              key: "secondInstallmentDueDate",
              label: "Second Installment Due Date",
            },
            {
              key: "thirdInstallmentAmount",
              label: "Third Installment Amount",
            },
            {
              key: "thirdInstallmentDueDate",
              label: "Third Installment Due Date",
            },
            { key: "plantationSerialNo", label: "Plantation Serial No." },
          ],
          user
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link href={`/admin/notifications/calendar/${user.projectId}`}>
            <button className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
              <Calendar className="w-4 h-4" />
              Notification Center
            </button>
          </Link>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete user {user.projectId} (
                  {user.nameOfGrower})? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
