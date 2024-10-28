import Link from "next/link";
import React from "react";

const ProjectCard = ({ project }) => {
  return (
    <Link href={`/admin/projects/addproject?projectId=${project.id}`}>
      <div
        className="relative w-80 h-72 rounded-md overflow-hidden shadow-lg cursor-pointer group"
        style={{
          backgroundImage: `url(${project.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Default state (with project title) */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white transition-all duration-300 group-hover:bg-opacity-60">
          <h3 className="text-3xl font-semibold mb-2 text-center">
            {project.title}
          </h3>
        </div>

        {/* Hover state (dark background with "See Project" appearing) */}
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center space-x-2 text-sm mt-10">
            <span>See Project</span>
            <span className="ml-2">»»</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
