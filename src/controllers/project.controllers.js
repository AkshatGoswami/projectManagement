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
const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { project } = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404, "Project not found");
    }
    return res.
            status(200)
            .json(new ApiResponse(200,
                project,
                "project fetched successfully"
            ))
})
const addMemberToProject = asyncHandler(async (req, res) => {
     const { email, role } = req.body;
     const { projectId } = req.params;
     const user = User.findOne({ email });
     if(!user){
        throw new ApiError(404, "User does not exists");
     }
     await ProjectMember.findByIdAndUpdate(
        {
            user: new mongoose.Types.ObjectId(user._id),
            project: new mongoose.Types.ObjectId(projectId)
        },
        {
            user: new mongoose.Types.ObjectId(user.req._id),
            project: new mongoose.Types.ObjectId(projectId), 
            role: role
        },
        {
            new: true,
            upsert: true
        }
     )
     return res.status(201).json(new ApiResponse(201, {}, "Member added successfully"))
    });
const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectID } = req.params;
    const project = await Project.findById(req.params);
    if(!project){
        throw new ApiError(404, "Project not found");
    }
    const projectMember = await ProjectMember.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectID)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]       


            }
        },
        {
            $addFields: {
                user: {
                    $arrayElemAt: ["$user", 0]
                }
            }
        },
        {
            $project: {
                project: 1,
                user: 1,
                role: 1,
                createdAt: 1,
                updatedAt: 1,
                _id: 0
            }    
        }, 
    ]);
    return res.status(200).json(new ApiResponse(200, projectMember, "Project member details fetched successfully"))
});
const updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, userID } = req.params;
    const { newRole } = req.body;
    if(!availableRoles.includes(newRole)){
        throw new ApiError(400, "New role is required");
    }
    const projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userID)
    })
    if(!projectMember){
        throw new ApiError(404, "Project member not found");
    }
    const updatedMember = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role: newRole
        },
        {
            new: true
        }
    )  
    if(!updatedMember){
        throw new ApiError(500, "Something went wrong while updating the member role");
    }

    return res.status(200).json(new ApiResponse(200, updatedMember, "Member role updated successfully"))
});
const deleteMember = asyncHandler(async (req, res) => {
    const { projectId, userID } = req.params;
    if(!availableRoles.includes(newRole)){
        throw new ApiError(400, "New role is required");
    }
    const projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userID)
    })
    if(!projectMember){
        throw new ApiError(404, "Project member not found");
    }
    const deletedMember = await ProjectMember.findByIdAndDelete(
        projectMember._id
    )  
    if(!deletedMember){
        throw new ApiError(500, "Something went wrong while removing the member from the project");
    }

    return res.status(200).json(new ApiResponse(200, deletedMember, "Member removed from project successfully"))
});

export { 
    createProject, 
    updateProject, 
    deleteProject,
    getProject,
    getProjectById,
    addMemberToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember,
}