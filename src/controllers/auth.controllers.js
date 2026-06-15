import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";

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
    });
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    console.log("Generated email verification token:", { unHashedToken, hashedToken, tokenExpiry });
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -forgotPasswordToken -forgotPasswordTokenExpiry -emailVerificationToken -emailVerificationTokenExpiry"
    );
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
      .status(200)
      .json(new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully. Please check your email to verify your account"
    ));
});

/*
  #Steps to login a user
   1. Take data from user
   2. Check if user exist
   3. Check if password is correct 
   4. Generate Tokens 
   5. Send tokens in cookies
   6. Validate

*/ 
// step 1 take data from user
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    //Step 2 check if user exist
    if(!email){         
        throw new ApiError(400, "Email does'nt exist");
    }
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(400, "User does'nt exist");
    }
    //Step 3 check if password is correct
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(400, "Invalid user credentials");
    }
    //Step 4 generate tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    //Step 5 send tokens in cookies
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(
        200,
        {
            user: user,
            accessToken,
            refreshToken
        },
        "User login successfully."
    ));

});
export {registerUser, loginUser};
