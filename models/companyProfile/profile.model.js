import { model, Schema } from "mongoose";

const overViewSchema = new Schema(
    {
        companyName: {
            type: String,
        
        },
        brandName: {
            type: String,
        },
        companyOfficialEmail: {
            type: String,
        },
        companyOfficialContact: {
            type: String,
        },
        website: {
            type: String,
        },
        domainName: {
            type: String,
        },
        industryTypes: {
            type: [String], // Multiple industries can be stored
        },
        logo: {
            public_id: { type: String, default: "" },
            secure_url: { type: String, default: "" },
        },
        
        // Simple address fields
        registeredOffice: {
            type: String, // e.g., "123 Main Street, Mumbai, Maharashtra, India"
        },
        
        corporateOffice: {
            type: String, // e.g., "456 Business Park, Delhi, India"
        },
        
        customAddress: {
            type: String, // e.g., "789 Custom Location, Bangalore, India"
        },

    },
    {
        timestamps: true,
    }
);

const ProfileModel = model("overViewSchema", overViewSchema);

export default ProfileModel;