import mongoose from "mongoose"
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { UserRolesEnum, AvailableTaskStatus } from "../utils/constants.js";
import { Task } from "../models/task.models.js";
import { subtask as Subtask } from "../models/subtask.models.js";

const createTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, status, assignedTo } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const attachments = (req.files || []).map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    });
    const task = await Task.create({
        title,
        description,
        status,
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments,
        project: new mongoose.Types.ObjectId(projectId),
    });
    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});
const getTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const tasks = await Task.find({ 
        project: new mongoose.Types.ObjectId(projectId) 
    }).populate("assignedTo", "avatar username fullname");

    return res.status(200).json(
        new ApiResponse(200, tasks, "Task fetched successfully")
    );
});
const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(taskId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo", 
                foreignField: "_id",
                as: "assignedTo",
                pipeline:[
                    {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    avatar: 1
                }
            ]
            }
        },
        {
            $lookup: {
                 from: "subtasks",
                localField: "_id", 
                foreignField: "task",
                as: "subtasks",
                pipeline:[
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy", 
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullname: 1,
                                        avatar: 1   
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: {
                                 $arrayElemAt: ["$createdBy", 0] 
                                }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0]
                }
            }
        }
    ]);
    if(!task || task.length === 0){
        throw new ApiError(404, "Task not found");
    }
    return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
});
const updateTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, status, assignedTo } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const updateTask = await Project.findByIdAndUpdate(
        projectId,
        {
            title,
            description, 
            status: AvailableTaskStatus.includes(status) ? status : undefined,
            assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined
        },
        { new: true }
    );
    return res.status(200).json(new ApiResponse(200, updateTask, "Task updated successfully"));    
});
const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    await Task.findByIdAndDelete(taskId);
    return res.status(200).
    json(new ApiResponse
        (200, {}, "Task deleted successfully"));
});
const createSubTask = asyncHandler(async (req, res) => {
    const { title, task, createdBy } = req.body;
    const parentTask = await Task.findById(task);
    if (!parentTask) {
        throw new ApiError(404, "Parent task not found");
    }
    const subtask = await Subtask.create({
        title,
        task: new mongoose.Types.ObjectId(task),
        createdBy: new mongoose.Types.ObjectId(createdBy)
    });
    return res.status(200).json(new ApiResponse(200, subtask, "Subtask created successfully")); 
});
const updateSubTask = asyncHandler(async (req, res) => {
    const { subtaskId } = req.params;
    const { title } = req.body;
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }
    const updatedSubtask = await Subtask.findByIdAndUpdate(
        subtaskId,
        { title },
        { new: true }
    );
    return res.status(200).json(new ApiResponse(200, updatedSubtask, "Subtask updated successfully"));  
});
const deleteSubTask = asyncHandler(async (req, res) => {
    const { subtaskId } = req.params;
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
        throw new ApiError(404, "Subtask not found");
    }
    await Subtask.findByIdAndDelete(subtaskId);
    return res.status(200).json(new ApiResponse(200, {}, "Subtask deleted successfully"));
});

export{
    createTask,
    createSubTask,
    updateTask,
    updateSubTask,
    deleteTask,
    deleteSubTask,
    getTask,
    getTaskById
}