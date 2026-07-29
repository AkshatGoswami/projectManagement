import mongoose from "mongoose"
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { UserRolesEnum } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    })
    if (!project) {
        throw new ApiError(500, "Something went wrong while creating the project");
    }
    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN
    })
    return res.status(200).json(new ApiResponse(200, { project }, "Project created successfully"))
})
const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { name, description },
        { new: true }
    );
    return res.status(200).json(new ApiResponse(200, { project: updatedProject }, "Project updated successfully"));
});
const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    return res.status(200).json(new ApiResponse(200, { project }, "Project deleted successfully"));
});
const getProject = asyncHandler(async (req, res) => {
    const projects = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
                pipeline: [
                    {
                        $lookup: {
                            from: "projectmembers",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectMembers",
                        }
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectMembers",
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$project",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdAt: 1,
                    createdBy: 1,
                },
                role: 1,
                _id: 0
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,
        projects,
        "Project fetched successfully"
    ))
});

export { 
    createProject, 
    updateProject, 
    deleteProject,
    getProject
}