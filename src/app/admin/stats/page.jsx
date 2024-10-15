"use client";

import React, { useState } from "react";
import PageHeader from "@/components/Page-header";
import { useFirestore } from "@/contexts/FirestoreContext";
import { useToast } from "@/hooks/use-toast";

const Page = () => {
  const { statsData, loading, updateData } = useFirestore();
  const { toast } = useToast();

  const [editableStats, setEditableStats] = useState({});
  const [isEditing, setIsEditing] = useState(false); // Manage edit mode

  // Handle input change
  const handleInputChange = (statId, value) => {
    setEditableStats((prevStats) => ({
      ...prevStats,
      [statId]: value, // Update the value for the specific statId
    }));
  };

  // Handle save stats
  const saveStats = async () => {
    try {
      for (const [statId, value] of Object.entries(editableStats)) {
        const stat = statsData.find((s) => s.id === statId);
        if (stat) {
          const updatedStat = { ...stat, value };
          const result = await updateData(statId, updatedStat, "stats");

          toast({
            title: result.message,
            description: "",
            className: `${
              result.success
                ? "bg-green-500 border-green-700"
                : "bg-red-500 border-red-700"
            } text-white border`,
          });
        }
      }
      setIsEditing(false); // Exit edit mode after saving
    } catch (error) {
      toast({
        title: "Failed to update the stats!",
        description: error.message,
        className: "bg-red-500 text-white border border-red-700",
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditableStats({}); // Reset editable stats
    setIsEditing(false); // Exit edit mode
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Stats" />
      <div className="mt-10 mx-6 text-4xl font-bold text-green-700">
        Basic Stats
      </div>
      <div className="my-5 mx-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className="border border-green-500 p-6 rounded-lg shadow-md bg-green-50"
          >
            <div className="text-xl font-bold text-green-700">{stat.title}</div>
            <input
              type="text"
              value={
                isEditing && editableStats[stat.id] !== undefined
                  ? editableStats[stat.id]
                  : stat.value
              }
              onChange={(e) => handleInputChange(stat.id, e.target.value)}
              className="w-full mt-4 p-2 border border-green-300 rounded-md focus:outline-none focus:ring focus:ring-green-200"
              disabled={!isEditing}
            />
          </div>
        ))}
      </div>
      <div className="my-8 mx-6">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-600 text-white px-6 py-3 rounded-md shadow hover:bg-yellow-700"
          >
            Edit
          </button>
        ) : (
          <>
            <button
              onClick={saveStats}
              className="bg-green-600 text-white px-6 py-3 rounded-md shadow hover:bg-green-700 mr-4"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-600 text-white px-6 py-3 rounded-md shadow hover:bg-red-700"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
