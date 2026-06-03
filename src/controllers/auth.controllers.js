import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId); 
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body
    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists", [])
    }
    const user = await User.create({
        email, password, username, isEmailverified: false
    })
    const {unHasedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken
    user.emailVerificationTokenExpiry = tokenExpiry
    await user.save({validateBeforeSave:false});
    await sendEmail({
        email:user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    })
    await User.findById(user._id).select("-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }   
    return res
      .status(200)
      .json(new ApiResponse(
        200,
        {user: createdUser},
        "User registered successfully. Please check your email to verify your account"
    ));
});
const loginUser = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(new ApiResponse(
        200,
        {user: createdUser},
        "User login successfully. Please check your email to verify your account"
    ));

});
export {registerUser, loginUser};
console.log("auth controllers")
