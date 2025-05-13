import express from 'express'
import AppError from '../util/appError.js'
import employeModel from '../models/employeeModel.js';
import employeeBankModel from '../models/employee.bank.model.js';

// const add_bank=async(req,res,next)=>{
//     try{        
//       //   return;
//             const {id}=req.params;
//             const {bankName,accountNumber,branch,ifscCode,bankCode,bankAddress,country}=req.body;
//             const validateEmployee=await employeModel.findById(id);
//             if(!validateEmployee){
//                  return next(new AppError("Employee have not validate",400))
//             }
//              const result=await employeeBankModel.create({
//                 employeeId:id,
//                 bankName,accountNumber,branch,ifscCode,bankCode,bankAddress,country
//              })
//              if(result){
//                 return res.status(200).json({success:true,message:"Bank Detail Add",result});
//              }
//              return next(new AppError("Some Error Occurred",400));

//     }catch(err){
//        return next(new AppError(err.message,500));
//     }
// }

const add_bank = async (req, res, next) => {
   try {
     const { id } = req.params;
   //   return
     const {
       bankName,
       accountNumber,
       branch,
       ifscCode,
       bankCode,
       bankAddress,
       country,
     } = req.body;
     const validateEmployee = await employeModel.findById(id);
     if (!validateEmployee) {
       return next(new AppError("Employee not found", 400));
     }
     const existingBankDetail = await employeeBankModel.findOne({ employeeId: id });
     let data;
     if (existingBankDetail) {
        existingBankDetail.bankName = bankName;
        existingBankDetail.accountNumber = accountNumber;
        existingBankDetail.branch = branch;
        existingBankDetail.ifscCode = ifscCode;
        existingBankDetail.bankCode = bankCode;
        existingBankDetail.bankAddress = bankAddress;
        existingBankDetail.country = country;
        
        data = await existingBankDetail.save();
      } else {
         // Create new record
         data = await employeeBankModel.create({
            employeeId: id,
            bankName,
            accountNumber,
            branch,
            ifscCode,
         bankCode,
         bankAddress,
         country,
      });
   }

   await employeModel.findByIdAndUpdate(id,{bankId:data._id});
    
     return res.status(200).json({
       success: true,
       message: existingBankDetail ? "Bank Detail Updated" : "Bank Detail Added",
       data:data,
     });
 
   } catch (err) {
     return next(new AppError(err.message, 500));
   }
 };
 



const update_bank_detail=async(req,res,next)=>{
   try{        
           const {id}=req.params;
           const {bankName,accountNumber,branch,ifscCode,bankCode,bankAddress,country}=req.body;
          
            const result= await employeeBankModel.findByIdAndUpdate(id,{
               employeeId:id,
               bankName,accountNumber,branch,ifscCode,bankCode,bankAddress,country, $inc: { __v: 1 },
            },{new:true})
            if(result){
               return res.status(200).json({success:true,message:"Bank Detail Update Successfully",result});
            }
            return next(new AppError("Some Error Occurred",400));

   }catch(err){
      return next(new AppError(err.message,500));
   }
}


const delet_bank_detail=async(req,res,next)=>{
   try{
        const{id}=req.params;
        
        const result =await employeeBankModel.findByIdAndDelete(id)

        if(result){
         return res.status(200).json({success:true,message:"Delete Success"});
        }
        return next(new AppError("Some Error Occurred",400));
   }catch(err){
      return next(new AppError(err.message,500))
   }
}


const get_bank_detail=async(req,res,next)=>{
   try{
         const {id}=req.params;

         const result=await employeeBankModel.findById(id).populate({
            path:"employeeId"
         })
         if(result){
            return res.status(200).json({success:true,message:"succes",result})
         }
         // return next(new AppError("De",400));
         
   }catch(err){
    return next(new AppError(err.message,500))
   }
}

const getOneData=async(req,res,next)=>{
   try{
         const {id}=req.params

         const result=await employeeBankModel.findOne({employeeId:id})
         if(result){
            return res.status(200).json({success:true,data:result})
         }else{
            return next(new AppError("Data not found",404 ));
         }
   }catch(err){
    return next(new AppError(err.message,500))
   }
}

export{add_bank,update_bank_detail,delet_bank_detail,get_bank_detail,getOneData}

