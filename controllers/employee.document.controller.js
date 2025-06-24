import AppError from "../util/appError.js";
import documentModel from "../models/employeeDocument/document.js";
import cloudinary from "cloudinary";


export const add_document = async (req, res, next) => {
        try {
                const files = req.files; // multer should be used
                const { id } = req.params;
                if (!id) {
                        return next(new AppError("Employee ID is required", 400));
                }
                const record = await documentModel.findOne({ employeeid: id });
                if (record) {
                        return next(new AppError("Record already exists", 400))
                }
                const docData = { employeeid: id };
                // Helper to upload each file
                const uploadToCloudinary = (file, folder) => {
                        return new Promise((resolve, reject) => {
                                const stream = cloudinary.v2.uploader.upload_stream(
                                        {
                                                folder: `EmployeeDocuments/${folder}`,
                                                resource_type: "auto", // handles image/pdf/etc.
                                        },
                                        (error, result) => {
                                                if (error) return reject(error);
                                                resolve({
                                                        public_id: result.public_id,
                                                        secure_url: result.secure_url,
                                                });
                                        }
                                );
                                stream.end(file.buffer); // send the buffer to cloudinary
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


export const documet_delete=async (req,res,next)=>{
        try {  
               const {id}=req.params;
               if(!id){
                return next (new AppError("Employee Id is required",400));
               }  
        } catch (err) {
               return next(new AppError(err.message,500)); 
        }
}