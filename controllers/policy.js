import AppError from "../util/appError.js"
import policeModel from "../models/police.js";
const policy_add=async(req,res,next)=>{
    try{
            const{titel,description}=req.body;
            if(!titel||!description){
                return next(new AppError("All field is require"))
            }         
            const response=await policeModel.create({
                titel,
                description
            })
            if(response){
                return res.status(200).json({success:true,response,message:"Policy Add Success"})
            }
            else{
                return next(new AppError("Some error Accured",400))
            }            
    }catch(err){
       return next(new AppError(err.message,500))
    }
}

const delet_policy=async(req,res,next)=>{
      try{
          const{id}=req.params;
        //   console.log(id);
        //   return;
           const result=await policeModel.findByIdAndDelete(id)
           if(result){
              return res.send(200).json({success:true,message:'Policy Delete'})
           }else{
            return next(new AppError("Some Error Accured"));
           }
      }catch(err){
         return next(new AppError(err.message,500));
      }
}

const policy_edit=async(req,res,next)=>{
    try{
        const { id } = req.params;
          const{titel,description}=req.body;
          if(!titel||!description){
              return next(new AppError("All field is require"));
          }

         const data=await policeModel.findByIdAndUpdate(id,{
            titel,
            description 
         },{new:true});
         if(data){
            return res.status(200).json({success:true,message:"success",data})
         }
         else{
            return next(new AppError("Some Error Accured"));
         }
    }catch(err){ 
       return next(new AppError(err.message,500));
    }
}

const allPolicy=async(req,res,next)=>{
    try{
          console.log("data");
        const data=await policeModel.find()
        if(data){
            return res.status(200).json({success:true,message:"Success",data:data})
        }else{
            return  next(new AppError("Some Error Occurred",404))
        }

    }catch(err){
        return next(new AppError(err.message,500));
    }
}

export{policy_add,delet_policy,policy_edit,allPolicy}