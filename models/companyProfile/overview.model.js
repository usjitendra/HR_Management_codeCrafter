import { model, Schema } from "mongoose";
import { type } from "os";

const overViewSchema = new Schema(
    {
        companyName: {
            type: String,
            required: true,
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

        registeredOfficeId: {
            type: Schema.Types.ObjectId,
            ref: "CompanyAddress"
        },

        corporateOfficeId:{
            type:Schema.Types.ObjectId,
            ref:"CompanyAddress"
        },
        customAddressId:{
            type:Schema.Types.ObjectId,
            ref:"CompanyAddress"
        },

        announcementId:{
             type:Schema.Types.ObjectId,
            ref:"Announcement"
        }
    },
    {
        timestamps: true,
    }
);

const companyOverModel = model("Overview", overViewSchema);

export default companyOverModel;
