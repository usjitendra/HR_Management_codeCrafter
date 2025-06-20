import { model, Model, Schema } from "mongoose";
import { type } from "os";

const otpSchema = new Schema(
    {
        email: {
            type: String,
            default: null
        },
        otp: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 7200, // Expires after 5 minutes
        },
    }
)

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
const otpModel = model("Otp", otpSchema)

export default otpModel;