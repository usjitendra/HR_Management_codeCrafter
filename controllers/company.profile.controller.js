// controllers/companyProfileController.js
import AppError from "../util/appError.js";
import cloudinary from "cloudinary";
import companyOverModel from "../models/companyProfile/overview.model.js";
import companyAddressModel from "../models/companyProfile/company.address.model.js";
import announcementModel from "../models/companyProfile/announcements.model.js";



export const company_overview = async (req, res, next) => {
    console.log("update");
    
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

export const update_company_overview = async (req, res, next) => {
  console.log("update company overview");

  try {
    const { id } = req.params; // Company overview ID from URL params

    const {
      companyName,
      brandName,
      companyOfficialEmail,
      companyOfficialContact,
      website,
      domainName,
      industryTypes,
    } = req.body;

    const updatedData = {
      companyName,
      brandName,
      companyOfficialEmail,
      companyOfficialContact,
      website,
      domainName,
      industryTypes: industryTypes?.split(",") || [],
    };

    if (req.file) {
      // Upload new logo if file provided
      const uploadFromBuffer = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { folder: "CompanyLogos" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const result = await uploadFromBuffer(req.file.buffer);

      updatedData.logo = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    const updatedCompany = await companyOverModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return next(new AppError("Company overview not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Company overview updated successfully.",
      data: updatedCompany,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const registrationOfficeAddress = async (req, res, next) => {
    console.log("update");
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

export const updateRegistrationOfficeAddress = async (req, res, next) => {
  console.log("update registration address");
  try {
    const { id } = req.params; // address document ID from URL params

    const {
      address1,
      address2,
      city,
      state,
      country,
      pincode,
      overviewId, // optional: if overview also needs update
    } = req.body;

    // Step 1: Update existing address
    const updatedAddress = await companyAddressModel.findByIdAndUpdate(
      id,
      {
        address1,
        address2,
        city,
        state,
        country,
        pincode,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return next(new AppError("Address record not found", 404));
    }

    // Step 2: If overviewId provided, update overview's registeredOfficeId
    let updatedOverview = null;
    if (overviewId) {
      updatedOverview = await companyOverModel.findByIdAndUpdate(
        overviewId,
        { registeredOfficeId: updatedAddress._id },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Registered office address updated successfully.",
      data: {
        updatedAddress,
        updatedOverview,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const corporateOfficeAddress = async (req, res, next) => {
    console.log("update");
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

export const updateCorporateOfficeAddress = async (req, res, next) => {
  console.log("update corporate address");
  try {
    const { id } = req.params; // address document ID from URL params

    const {
      address1,
      address2,
      city,
      state,
      country,
      pincode,
      overviewId, // optional: if overview also needs update
    } = req.body;

    // Step 1: Update existing address
    const updatedAddress = await companyAddressModel.findByIdAndUpdate(
      id,
      {
        address1,
        address2,
        city,
        state,
        country,
        pincode,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return next(new AppError("Corporate address record not found", 404));
    }

    // Step 2: If overviewId provided, update overview's corporateOfficeId
    let updatedOverview = null;
    if (overviewId) {
      updatedOverview = await companyOverModel.findByIdAndUpdate(
        overviewId,
        { corporateOfficeId: updatedAddress._id },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Corporate office address updated successfully.",
      data: {
        updatedAddress,
        updatedOverview,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const customAddress = async (req, res, next) => {
    console.log("update");
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

export const updateCustomAddress = async (req, res, next) => {
  console.log("update custom address");
  try {
    const { id } = req.params; // address document ID from URL params

    const {
      address1,
      address2,
      city,
      state,
      country,
      pincode,
      overviewId, // optional: if overview also needs update
    } = req.body;

    // Step 1: Update existing address
    const updatedAddress = await companyAddressModel.findByIdAndUpdate(
      id,
      {
        address1,
        address2,
        city,
        state,
        country,
        pincode,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return next(new AppError("Custom address record not found", 404));
    }

    // Step 2: If overviewId provided, update overview's customAddressId
    let updatedOverview = null;
    if (overviewId) {
      updatedOverview = await companyOverModel.findByIdAndUpdate(
        overviewId,
        { customAddressId: updatedAddress._id },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Custom address updated successfully.",
      data: {
        updatedAddress,
        updatedOverview,
      },
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

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params; // Announcement ID from URL params
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return next(new AppError("Message is required", 400));
    }

    const updatedAnnouncement = await announcementModel.findByIdAndUpdate(
      id,
      { message },
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return next(new AppError("Announcement not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: updatedAnnouncement,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await announcementModel.findByIdAndDelete(id);

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Announcement deleted successfully",
        data: result,
      });
    }

    return next(new AppError("Record not found", 404));
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

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
    console.log("update");
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


export const allAnnouncement=async(req,res,next)=>{
  try {
        const result=await announcementModel.find().sort({createdAt: -1})
        if(result.length<=0){
            return next(new AppError("No announcements available", 400));
        }
        return res.status(200).json({success:true,message:"Found successfully",data:result});
  } catch (err) {
       return next(new AppError(err.message,500))
  }
}



