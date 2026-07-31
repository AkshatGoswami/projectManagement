import { body, param } from "express-validator";
import { AvailableTaskStatus, AvailableUserRoles } from "../utils/constants.js";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Usename must be in lower case")
            .isLength({min:4})
            .withMessage("Username must be atleast 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),    
         body("fullName")
            .trim()
            .notEmpty()
            .withMessage("Full name is required")
            .isLength({ min: 3 })
            .withMessage("Full name must be at least 3 characters long")     
            
    ];
};
const userLoginValidator = () => {
    //step 6 validate
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
    ];
};
const forgotPasswordValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
    ];
}
const resetPasswordValidator = () => {
    return [
        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")
    ];
}   
const changeCurrentPasswordValidator = () => {
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old password is required"),
        body("newPassword")
            .notEmpty()
            .withMessage("New password is required")
            .isLength({ min: 6 })
            .withMessage("New password must be at least 6 characters long")
    ];
}
//Project Validators
const createProjectValidator = () =>{
    return [
        body("name")
          .notEmpty()
          .withMessage("Name is required"),
        body("description").optional(),

    ];
};
const addMembertoProjectValidator = () => {
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid"),
        body("role")
         .notEmpty()
         .withMessage("Role is required")
         .isIn(AvailableUserRoles)
         .withMessage("Role is invalid")
    ] 
}
//Task Validators
const createTaskValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Title is required")
            .isLength({ min: 3, max: 100 })
            .withMessage("Title must be between 3 and 100 characters"),
        body("description")
            .optional({ values: "falsy" })
            .trim()
            .isLength({ max: 1000 })
            .withMessage("Description must be at most 1000 characters"),
        body("status")
            .optional()
            .isIn(AvailableTaskStatus)
            .withMessage("Status is invalid"),
        body("assignedTo")
            .optional()
            .isMongoId()
            .withMessage("Assigned user ID is invalid")
    ];
};

const updateTaskValidator = () => {
    return [
        body("title")
            .optional({ values: "falsy" })
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage("Title must be between 3 and 100 characters"),
        body("description")
            .optional({ values: "falsy" })
            .trim()
            .isLength({ max: 1000 })
            .withMessage("Description must be at most 1000 characters"),
        body("status")
            .optional()
            .isIn(AvailableTaskStatus)
            .withMessage("Status is invalid"),
        body("assignedTo")
            .optional()
            .isMongoId()
            .withMessage("Assigned user ID is invalid")
    ];
};

const createSubTaskValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Title is required")
            .isLength({ min: 3, max: 100 })
            .withMessage("Title must be between 3 and 100 characters"),
        body("task")
            .notEmpty()
            .withMessage("Task ID is required")
            .isMongoId()
            .withMessage("Task ID is invalid"),
        body("createdBy")
            .notEmpty()
            .withMessage("Creator is required")
            .isMongoId()
            .withMessage("Creator ID is invalid")
    ];
};

const projectIdParamValidator = () => {
    return [
        param("projectId")
            .notEmpty()
            .withMessage("Project ID is required")
            .isMongoId()
            .withMessage("Project ID is invalid")
    ];
};

const taskIdParamValidator = () => {
    return [
        param("taskId")
            .notEmpty()
            .withMessage("Task ID is required")
            .isMongoId()
            .withMessage("Task ID is invalid")
    ];
};
// Project Notes Validators
const createProjectNoteValidator = () => {
    return [
        body("content")
            .notEmpty()
            .withMessage("Note content is required")
            .isLength({ max: 1000 })
            .withMessage("Note content must be at most 1000 characters")
    ];
};

const projectNoteIdParamValidator = () => {
    return [
        param("projectNoteId")
            .notEmpty()
            .withMessage("Project Note ID is required")
            .isMongoId()
            .withMessage("Project Note ID is invalid")
    ];
};

export { userRegisterValidator, 
    userLoginValidator, 
    forgotPasswordValidator, 
    resetPasswordValidator, 
    changeCurrentPasswordValidator,
    createProjectValidator,
    addMembertoProjectValidator,
    createTaskValidator,
    updateTaskValidator,
    createSubTaskValidator,
    projectIdParamValidator,
    taskIdParamValidator,
    createProjectNoteValidator,
    projectNoteIdParamValidator
 };