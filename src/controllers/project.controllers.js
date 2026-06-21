import mongoose from "mongoose"
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";

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
    await projectMemeber.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRoles.ADMIN
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