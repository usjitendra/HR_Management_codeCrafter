// controllers/companyProfileController.js
import AppError from "../util/appError.js";
import cloudinary from "cloudinary";
import companyOverModel from "../models/companyProfile/overview.model.js";
import companyAddressModel from "../models/companyProfile/company.address.model.js";
import announcementModel from "../models/companyProfile/announcements.model.js";

export const company_overview = async (req, res, next) => {
  try {
    const {
      companyName,
      brandName,
      companyOfficialEmail,
      companyOfficialContact,
      website,
      domainName,
      industryTypes,
    } = req.body;

    const overviewData = {
      companyName,
      brandName,
      companyOfficialEmail,
      companyOfficialContact,
      website,
      domainName,
      industryTypes: industryTypes?.split(",") || [], // If comma-separated
    };

    if (req.file) {
      // Uploading buffer directly
      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            {
              folder: "CompanyLogos",
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const result = await uploadFromBuffer(req.file.buffer);

      overviewData.logo = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    const newCompany = await companyOverModel.create(overviewData);


    res.status(200).json({
      success: true,
      message: "Company overview added successfully.",
      data: newCompany,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const registrationOfficeAddress = async (req, res, next) => {
  try {
    const {
      address1,
      address2,
      city,
      state,
      country,
      pincode,
      overviewId, // ID of the company overview document
    } = req.body;

    // Step 1: Create address
    const newAddress = await companyAddressModel.create({
      address1,
      address2,
      city,
      state,
      country,
      pincode,
    });

    // Step 2: Update overview with address id
    const updatedOverview = await companyOverModel.findByIdAndUpdate(
      overviewId,
      { registeredOfficeId: newAddress._id },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Registered office address added successfully.",
      data: newAddress
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const corporateOfficeAddress = async (req, res, next) => {
  try {
    const {
      address1,
      address2,
      city,
      state,
      country,
      pincode,
      overviewId, // ID of the company overview document
    } = req.body;

    // Step 1: Create address
    const newAddress = await companyAddressModel.create({
      address1,
      address2,
      city,
      state,
      country,
      pincode,
    });

    // Step 2: Update overview with address id
    const updatedOverview = await companyOverModel.findByIdAndUpdate(
      overviewId,
      { corporateOfficeId: newAddress._id },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Added corporate office address successfully.",
      data: newAddress,
      updatedOverview
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const customAddress = async (req, res, next) => {
  try {
    const {
      address1,
      address2,
      city,
      state,
      country,
      pincode,
      overviewId, // ID of the company overview document
    } = req.body;

    // Step 1: Create address
    const newAddress = await companyAddressModel.create({
      address1,
      address2,
      city,
      state,
      country,
      pincode,
    });

    // Step 2: Update overview with address id
    const updatedOverview = await companyOverModel.findByIdAndUpdate(
      overviewId,
      { customAddressId: newAddress._id },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Added corporate office address successfully.",
      data: newAddress,
      updatedOverview
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const announcement = async (req, res, next) => {
  try {
    const { message, overviewId} = req.body;

    if (!message || message.trim() === "") {
      return next(new AppError("Message is required", 400));
    }

    const newAnnouncement = await announcementModel.create({ message });
    const updatedOverview = await companyOverModel.findByIdAndUpdate(
      overviewId,
      { announcementId: newAnnouncement._id },
      { new: true }
    );
    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: updatedOverview,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
}

export const getOverviewData = async (req, res, next) => {
  try {
    const result = await companyOverModel.find();

    return res.status(200).json({
      success: true,
      message: "Overview Data",
      data: result,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const getAllData=async(req,res,next)=>{
    try {
            const result=await companyOverModel.find()
            console.log("result",result[0].registeredOfficeId);
            const registeredOfficeAddress=await companyAddressModel.findById(result[0].registeredOfficeId);
            const corporateOfficeAddress=await companyAddressModel.findById(result[0].corporateOfficeId);
            const customAddress=await companyOverModel.findById(result[0].customAddressId);
            console.log("corporateOfficeAddress",corporateOfficeAddress);
             
            const allData={
             overviewData:result[0],
             registeredOfficeAddress:registeredOfficeAddress,
              corporateOfficeAddress:corporateOfficeAddress,
              customAddress:customAddress
            }
          
            return res.status(200).json({success:true,messaging:"All company profile Data",data:allData});
    } catch (err) {
      return next(new AppError(err.message,500));
    }
}