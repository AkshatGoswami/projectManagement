import { createProjectNoteValidator, projectNoteIdParamValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateProjectRole } from "../middlewares/role.middleware.js";
import { AvailableUserRoles, UserRolesEnum, TaskStatus, AvailableTaskStatus } from "../utils/constants.js";
import { createProjectNotes, getProjectNotesById, updateProjectNotes, deleteProjectNotes, getProjectNotes } from "../controllers/notes.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/:projectId")
      .get(validateProjectRole(AvailableUserRoles), getProjectNotes)
      .post(validateProjectRole([UserRolesEnum.ADMIN]), createProjectNoteValidator(), validate, createProjectNotes);

router.route("/:projectId/n/:noteId")
      .get(validateProjectRole(AvailableUserRoles), getProjectNotesById)
      .put(validateProjectRole([UserRolesEnum.ADMIN]), createProjectNoteValidator(), validate, updateProjectNotes)
      .delete(validateProjectRole([UserRolesEnum.ADMIN]), projectNoteIdParamValidator(), validate, deleteProjectNotes);

export default router;