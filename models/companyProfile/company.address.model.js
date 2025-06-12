import { model, Schema } from "mongoose";

const addressSchema = new Schema(
  {
    address1: {
      type: String,
      default: "",
    },
    address2: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    pincode: {
      type: Number,
      default: null, // or use 0 if that makes sense for your logic
    },
  },
  {
    timestamps: true,
  }
);

const companyAddressModel = model("CompanyAddress", addressSchema);

export default companyAddressModel;
