import {Router} from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser, verifyEmail,
     resendEmailVerification, resetForgotPassword} from '../controllers/auth.controllers.js';
import { userRegisterValidator, userLoginValidator,
        forgotPasswordValidator, resetPasswordValidator}
 from '../validators/index.js';
import { validate } from '../middlewares/validator.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
//Unsecure routes
router.route("/register").post(userRegisterValidator() , validate, registerUser);
router.route('/login').post(userLoginValidator(), validate, loginUser);
router.route('/verify-email/:verificationToken').get(verifyEmail);
router.route('/forgot-password').post(forgotPasswordValidator(), validate, forgotPasswordRequest);
router.route('/reset-forgot-password/:resetToken').post(resetPasswordValidator(), validate, resetForgotPassword);
//Secure routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/resend-email-verification').post(verifyJWT, resendEmailVerification);
export default router;