import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent } from "../utils/mail.js";

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

const loginUser = asyncHandler(async (req, res) => {
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
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
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
const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(req.user._id, 
    {
        $set:{
         refreshToken: null 
        }
    }, 
        {
          new: true 
        });
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    };
    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(
        200,
        {},
        "User logged out successfully."
      ));
});
const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current user fetched successfully"))
});
const verifyEmail = asyncHandler(async(req, res) => {
    const { verificationToken } = req.params;
    //req.params is basiically use to get the access of 
    if(!verificationToken){
        throw new ApiError(400, "Email verification token is missing")
    }
    let hashedToken = crypto
         .createHash("sha256")
         .update(verificationToken)
         .digest("hex")
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: {$gt: Date.now()}
    })     
    if(!user){
        throw new ApiError(400, "Token is invalid or expired")
    }
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    user.isEmailverified = true;
    //saving to DB
    await user.save({validateBeforeSave: false});
    return res
        .status(200)
        .json(
            new ApiResponse(200, { isEmailverified: true}, "Email is verified"))
        })
const resendEmailVerification = asyncHandler(async(req, res0) => {
    const user = await User.findById(req.user?._id);
    if(!user){
        throw ne
         ApiError(404, "User does not exist")
    }
    if(user.isEmailverified){
        throw new ApiError(409, "Email is already verified");
    }
    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    User.emailVerificationExpiry = tokenExpiry;
    await user.save({validateBeforeSave: false})
    await sendEmail({
        email: user?.email,
        subject:"Please verify your email",
        mailgenContent: emailVerificatiionMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });
    return res 
        .status(200)
        .json(
            new ApiResponse(200, {}, "Mail has been sent to your email ID")
        )
})  
const forgotPasswordRequest = asyncHandler(async(req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(400, "Invalid Email")
    }
    const {hashedToken, unHashedToken, tokenExpiry} = generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordTokenExpiry = tokenExpiry;
    await user.save({validateBeforeSave: false});
    await sendEmail({
        email: user?.email,
        subject:"Please verify your email",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )});
        return res
            .status(200)
            .json (new ApiResponse(
                200, {}, "Forgot password email has been sent successfully"
            ));
});  
const resetForgotPassword = asyncHandler(async(req, res) => {
    // get data from request
    const {resetToken} = req.params;
    const {newPassword} =req.body;

    let hashedToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex") 
        
    const user = User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordTokenExpiry : {$gt : Date.now()}
    })  
    if(!user){
        throw new ApiError(489, "Invalid token or expired");
    }    
    user.password = new password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save({validateBeforeSave: false});
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password has been reset successfully"))
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    forgotPasswordRequest,
    resendEmailVerification,
    resetForgotPassword,
};
 