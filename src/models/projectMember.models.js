import mongoose, { Schema } from 'mongoose';
import {AvailableUserRole, UserRolesEnum} from "../utils/constants.js"

const projectMemberSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    project:{
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    }
    role:{
        type
    }
},{timestamps:true})