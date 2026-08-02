import mongoose from "mongoose"
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectMember.models.js";
import { Task } from "../models/task.models.js";
import { subtask as Subtask } from "../models/subtask.models.js";
import { Notes } from "../models/note.models.js";


const createProjectNotes = asyncHandler(async (req, res) => {
    const { prjectId } = req.params;
    const { createdBy, content } = req.body;
    const project = await Project.findById(prjectId);

    if(!project){
        throw new ApiError(404, " Project not found ");
    }
   const notes = await Notes.create({
        project: new mongoose.Types.ObjectId(prjectId),
        createdBy: new mongoose.Types.ObjectId(req.user._id),
        content
    });

    return res.status(200).json(new ApiResponse(
        200, notes, "Notes creayed successfully"
    ));
});
const getProjectNotes = asyncHAndler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if(!project) {
        throw new ApiError(404, " Project not found ");
    }
    const notes = await Notes.find({ project: new mongoose.Types.ObjectId(projectId) });
    return res.status(200).json(new ApiResponse(
        200, notes, "Notes fetched successfully"
    ));
});
const getProjectNotesById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const notes = await Notes.findById(projectId);
    if (!notes) {
        throw new ApiError(404, "Notes not found");
    }
    return res.status(200).json(new ApiResponse(200, { notes }, "Notes fetched successfully"));
});
const updateProjectNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params; 
    const { content, createdBy } = req.body;
    const project = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404, " Project not found ");
    }
    const updatedNotes = await Notes.findByIdAndUpdate(
        projectId,
        { content, createdBy },
        { new: true }
    );
    return res.status(200).json(new ApiResponse(
        200, updatedNotes, "Notes updated successfully"
    ));
});
const deleteProjectNotes = asyncHandler(async (req, res) => {
   const { projectId } = req.params; 
   const project = await Project.findByIdAndDelete(projectId);
    if(!project){
        throw new ApiError(404, " Project not found ");
    }
    return res.status(200).json(new ApiResponse(
        200, null, "Notes deleted successfully"
    ));
});

export{
    createProjectNotes,
    getProjectNotesById,
    updateProjectNotes,
    deleteProjectNotes,
    getProjectNotes
} 