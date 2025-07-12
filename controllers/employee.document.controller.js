import AppError from "../util/appError.js";
import documentModel from "../models/employeeDocument/document.js";
import cloudinary from "cloudinary";




export const add_document = async (req, res, next) => {
  try {
    const files = req.files;
    const { id } = req.params;
    if (!id) {
      return next(new AppError("Employee ID is required", 400));
    }
    const record = await documentModel.findOne({ employeeid: id });
    if (record) {
      return next(new AppError("Record already exists", 400));
    }
    const docData = { employeeid: id };
    const uploadToCloudinary = (file, folder) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: `EmployeeDocuments/${folder}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) return reject(error);

            const fullPublicId = `${result.public_id}.${result.format}`;

            resolve({
              public_id: fullPublicId,
              secure_url: result.secure_url,
            });
          }
        );
        stream.end(file.buffer);
      });
    };
    if (files?.pan) {
      docData.pan = await uploadToCloudinary(files.pan[0], "PAN");
    }
    if (files?.aadhaar) {
      docData.aadhaar = await uploadToCloudinary(files.aadhaar[0], "AADHAAR");
    }
    if (files?.passbook) {
      docData.passbook = await uploadToCloudinary(files.passbook[0], "PASSBOOK");
    }
    if (files?.highSchool) {
      docData.highSchool = await uploadToCloudinary(files.highSchool[0], "HIGHSCHOOL");
    }
    if (files?.graduation) {
      docData.graduation = await uploadToCloudinary(files.graduation[0], "GRADUATION");
    }
    if (files?.salarySlip) {
      docData.salarySlip = await uploadToCloudinary(files.graduation[0], "SALARYSLIP");
    }
    // if (files?.additional) {
    //   docData.salarySlip = await uploadToCloudinary(files.graduation[0], "Additional");
    // }
    const newDocument = await documentModel.create(docData);
    res.status(201).json({
      success: true,
      message: "Documents uploaded successfully",
      data: newDocument,
    });

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};



export const document_get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await documentModel.findOne({ employeeid: id })
    return res.status(200).json({ success: true, message: "Employee All Document", data: document })
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
}

export const delete_document = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Employee ID is required", 400));
    }


    const record = await documentModel.findOne({ employeeid: id });
    console.log(record);
    // return

    if (!record) {
      return next(new AppError("Document not found", 404));
    }

    // Helper function to delete from Cloudinary
    const deleteFromCloudinary = async (fileData) => {
      if (fileData?.public_id) {
        await cloudinary.v2.uploader.destroy(fileData.public_id, {
          resource_type: "raw",
        });
      }
    };

    // Delete all attached documents from Cloudinary
    await Promise.all([
      deleteFromCloudinary(record.pan),
      deleteFromCloudinary(record.aadhaar),
      deleteFromCloudinary(record.passbook),
      deleteFromCloudinary(record.highSchool),
      deleteFromCloudinary(record.graduation),
      deleteFromCloudinary(record.salarySlip),
    ]);

    // Delete document record from MongoDB
    await documentModel.deleteOne({ employeeid: id });

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });

  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};


export const update_document = async (req, res, next) => {
  try {
    const files = req.files;
    const { id } = req.params;
    console.log(files);

    if (!id) {
      return next(new AppError("Employee ID is required", 400));
    }

    const existingDoc = await documentModel.findOne({ employeeid: id });

    if (!existingDoc) {
      return next(new AppError("Document not found to update", 404));
    }

    // Helper: delete from Cloudinary
    const deleteFromCloudinary = async (fileData) => {
      if (fileData?.public_id) {
        await cloudinary.v2.uploader.destroy(fileData.public_id, {
          resource_type: "raw",
        });
      }
    };

    // Helper: upload to Cloudinary
    const uploadToCloudinary = (file, folder) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: `EmployeeDocuments/${folder}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              public_id: `${result.public_id}.${result.format}`,
              secure_url: result.secure_url,
            });
          }
        );
        stream.end(file.buffer);
      });
    };

    const docFields = [
      { name: "pan", folder: "PAN" },
      { name: "aadhaar", folder: "AADHAAR" },
      { name: "passbook", folder: "PASSBOOK" },
      { name: "highSchool", folder: "HIGHSCHOOL" },
      { name: "graduation", folder: "GRADUATION" },
      { name: "salarySlip", folder: "SALARYSLIP" },
    ];

    for (const field of docFields) {
      if (files?.[field.name]) {
        await deleteFromCloudinary(existingDoc[field.name]);
        const uploaded = await uploadToCloudinary(files[field.name][0], field.folder);
        existingDoc[field.name] = uploaded;
      }
    }

    await existingDoc.save();

    res.status(200).json({
      success: true,
      message: "Documents updated successfully",
      data: existingDoc,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export const deleteUploadedDocuments_one = async (req, res, next) => {
  try {
    const files = req.files;
    console.log("Files received:", req.files);
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }
    const { id } = req.params;
    if (!id) {
      return next(new AppError("Employee ID is required", 400));
    }

    const record = await documentModel.findOne({ employeeid: id });
    if (!record) {
      return next(new AppError("No document record found for employee", 404));
    }

    const fields = ["pan", "aadhaar", "passbook", "highSchool", "graduation", "salarySlip"];
    for (const field of fields) {
      if (files?.[field]) {
        if (record[field]?.public_id) {
          console.log(`Deleting existing ${field} -> ${record[field].public_id}`);
          await cloudinary.v2.uploader.destroy(record[field].public_id.split(".")[0]);

          // Hard delete field from MongoDB
          await documentModel.updateOne(
            { employeeid: id },
            { $unset: { [field]: "" } }
          );
        }
      }
    }
    const updatedRecord = await documentModel.findOne({ employeeid: id });
    res.status(200).json({
      success: true,
      message: "Requested documents deleted successfully",
      data: updatedRecord,
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

