import { log } from 'node:console';
import employeModel from '../models/employeeModel.js'
import AppError from '../util/appError.js'
import AttandanceModel from '../models/attandance.model.js';


const  attandanceLogin=async(req,res,next)=>{
     try{

        const {id}=req.params
        const validEmployee=await employeModel.findById(id)

        if(!validEmployee){
              return next(new AppError("Employee is Not Valid",400))
        }
       
        const now=new Date()

        const allEmployeeAttandance=await AttandanceModel.find({employeeId:validEmployee._id})
        
        const filterEmployee = allEmployeeAttandance.find((val) => {
            const loginDate = new Date(val.loginTime).toLocaleDateString(); // India Format: DD/MM/YYYY
            const today = now.toLocaleDateString();
            return loginDate === today;
        });

        if(filterEmployee.status==="absent"){
              return next(new AppError("Employee is Already Absent",400))
        }

        if(filterEmployee.loginTime){
              return next(new AppError("Already Check in",400))
        }
        

        if(allEmployeeAttandance.loginTime){
              return next(new AppError("Already Login"))
        }
        
            
        const addEmployee=await AttandanceModel.create({
             employeeId:validEmployee._id,
             loginTime:now,
             date:now,
             status:"present"
            //  date:date.toLocaleDateString()
        })

        await addEmployee.save()

        res.status(200).json({
            success:true,
            message:"Attandance Mark Succesfully",
            data:addEmployee
        })

        


     }catch(error){
        console.log(error);
        
          return next(new AppError(error.message,500))
     }
}


const attandanceLogout=async(req,res,next)=>{
     try{
        const {id}=req.params
        const validEmployee=await employeModel.findById(id)

        if(!validEmployee){
              return next(new AppError("Employee is Not Valid",400))
        }
       
        const now=new Date()


        const allEmployeeAttandance=await AttandanceModel.find({employeeId:validEmployee._id})
        

        const filterEmployee = allEmployeeAttandance.find((val) => {
            const loginDate = new Date(val.loginTime).toLocaleDateString(); // India Format: DD/MM/YYYY
            const today = now.toLocaleDateString();
            return loginDate === today;
        });

        if(filterEmployee.status==="absent"){
              return next(new AppError("Employee is Absent",400))
        }

        if(!filterEmployee.loginTime){
              return next(new AppError("Employee is Not Login",400))
        }

        if(filterEmployee.logoutTime){
              return next(new AppError("Employee is Not Logout",400))
        }

        filterEmployee.logoutTime=now

        await filterEmployee.save()

        res.status(200).json({
            success:true,
            message:"Logout Succesfully"
        })

 

     }catch(error){
          return next(new AppError(error.message,500))
     }
}

export {attandanceLogin,attandanceLogout}
