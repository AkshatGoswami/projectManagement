import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        avatar: {
            type:{
                url: String,
                localpPath: String
            },
            default: {
                url: 'https://placehold.co/200x200',
                localpPath: ''
            }
            },
            username: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true, 
                index: true
            },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
           trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        isEmailverified: {
            type: Boolean,
            default: false      
        },
        refreshToken :{
            type: String,
        },
        forgotPasswordToken: {
            type: String,       
        },
        forgotPasswordTokenExpiry: {
            type: Date,
        },
        emasilVerificationToken: {
            type: String,
        },  
        emailVerificationTokenExpiry: {
            type: Date,
        },
    },

    {
        timestamps: true,
    }
);
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
   this.password = await bcrypt.hash(this.password, 10);
    next();
});
userSchema.methods.isPasswordCoreect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export const User = mongoose.model('User', userSchema);

 