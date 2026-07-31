import { Router } from "express";
import {createProject, updateProject,
        deleteProject, getProject,
        getProjectById, addMemberToProject,
        getProjectMemberDetails, updateMemberRole,
         deleteMember}from "../controllers/project.controllers";
import {
  createTask,
  getTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
} from "../controllers/task.controllers.js";
import {
  createTaskValidator,
  updateTaskValidator,
  createSubTaskValidator,
  projectIdParamValidator,
  taskIdParamValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateProjectRole } from "../middlewares/role.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router.route("/:projectId")
      .get(validateProjectRole(AvailableUserRoles),getTask)
      .post(validateProjectRole([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), validate, createTask)

router.route("/:projectId/t/:taskId")
      .get(validateProjectRole(AvailableUserRoles), projectIdParamValidator(), validate, getTaskById)
      .put(validateProjectRole([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), projectIdParamValidator(), createTaskValidator(), validate, updateTask)
      .delete(validateProjectRole([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), projectIdParamValidator(), taskIdParamValidator(), validate, deleteTask);

router.route("/:projectId/t/:subtasks")
      .get(validateProjectRole([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), projectIdParamValidator(), taskIdParamValidator(), createSubTaskValidator(), validate, createSubTask);

router.route("/:projectId/st/:subtaskId")
      .put(validateProjectRole(AvailableUserRoles), projectIdParamValidator(), taskIdParamValidator(), validate, updateSubTask)
      .delete(validateProjectRole([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), projectIdParamValidator(), taskIdParamValidator(), validate, deleteSubTask);

export default router;