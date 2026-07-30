import { body } from "express-validator";
import { AvailableUserRoles } from "../utils/constants";

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

export { userRegisterValidator, 
    userLoginValidator, 
    forgotPasswordValidator, 
    resetPasswordValidator, 
    changeCurrentPasswordValidator,
    createProjectValidator,
    addMembertoProjectValidator
 };