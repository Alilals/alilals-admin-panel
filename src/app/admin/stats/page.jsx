"use client";

import React, { useState } from "react";
import PageHeader from "@/components/Page-header";
import { useFirestore } from "@/contexts/FirestoreContext";
import { useToast } from "@/hooks/use-toast";

const Stats = () => {
  const { statsData, loading, updateData } = useFirestore();
  const { toast } = useToast();

  const [editableStats, setEditableStats] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Handle input change
  const handleInputChange = (statId, value) => {
    setEditableStats((prevStats) => ({
      ...prevStats,
      [statId]: value,
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
      setIsEditing(false);
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
    setEditableStats({});
    setIsEditing(false);
  };

  return (
    <div>
      <PageHeader title="Stats" />
      <div className="mt-10 mx-6 text-4xl font-bold text-green-700">
        Basic Stats
      </div>
      {loading ? (
        <div className="flex justify-center items-center mt-20">
          {/* Loading Spinner */}
          <div className="w-12 h-12 border-4 border-green-400 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="my-5 mx-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statsData.map((stat) => (
            <div
              key={stat.id}
              className="border border-green-500 p-6 rounded-lg shadow-md bg-green-50"
            >
              <div className="text-xl font-bold text-green-700">
                {stat.title}
              </div>
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
      )}
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
              onClick={handleCancel}
              className="bg-red-600 text-white px-6 py-3 rounded-md shadow hover:bg-red-700 mr-4"
            >
              Cancel
            </button>
            <button
              onClick={saveStats}
              className="bg-green-600 text-white px-6 py-3 rounded-md shadow hover:bg-green-700"
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;
