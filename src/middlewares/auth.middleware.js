import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
    // Access the access token from cookie, Authorization header, request body, or query
    const token =
        req.cookies?.accessToken ||
        req.get("authorization")?.replace(/^Bearer\s+/i, "") ||
        req.body?.accessToken ||
        req.query?.accessToken;

    if (!token) {
        throw new ApiError(401, "Unauthorised request. Access token is missing.");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});

export { verifyJWT };