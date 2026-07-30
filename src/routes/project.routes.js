import { Router } from "express";
import {createProject, updateProject,
        deleteProject, getProject,
        getProjectById, addMemberToProject,
        getProjectMemberDetails, updateMemberRole,
         deleteMember}from "../controllers/project.controllers";
import { createProjectValidator, addMembertoProjectValidator } from "../validators/index.js";     
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateProjectRole } from "../middlewares/role.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);
//Secure routes
router.route("/")
      .get(getProject)
      .post(createProjectValidator(), validate, createProject);

router.route("/:projectId")
      .get(validateProjectRole(AvailableUserRoles), getProjectById)
      .put(validateProjectRole([UserRolesEnum.ADMIN]), validate, updateProject)
      .delete(validateProjectRole([UserRolesEnum.ADMIN]), deleteProject); 

router.route("/:projectId/members")
       .get(validateProjectRole(getProjectMembers))
       .post(validateProjectRole([UserRolesEnum.ADMIN]), 
       addMembertoProjectValidator(), validate, addMemberToProject);  

router.route("/:projectId/members/:userID")
      .put(validateProjectRole([UserRolesEnum.ADMIN]), updateMemberRole)
      .delete(validateProjectRole([UserRolesEnum.ADMIN]), deleteMember);
      
export default router;
