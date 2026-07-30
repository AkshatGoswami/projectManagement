import { asyncHandler } from "../utils/async-handler";
import { ProjectMember } from "../models/projectMember.models.js";

export const validateProjectRole = (roles=[]) =>{
     asyncHandler(async (req, res, next) => {
            const { projectId } = req.params;
            if(!projectId){
                throw new ApiError(400, "Project ID is required");
            }
            const projectMember = await ProjectMember.findOne({
                project: new mongoose.Types.ObjectId(projectId),
                user: new mongoose.Types.ObjectId(req.user._id)
            })
            if(!projectMember){
                throw new ApiError(403, "You are not a member of this project");
            }
            const availableRoles = projectMember?.role;

            if(!roles.includes(projectMember.role)){
                throw new ApiError(403, "You do not have permission to perform this action");
            }
            next();
    });
};