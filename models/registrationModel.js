import { model,Schema } from "mongoose";
import { type } from "os";
import bcrypt from 'bcryptjs';
const registrationSchema=new Schema(
    {
       name:{
        type:String,
        required:true
       },
       email:{
        type:String,
        required:true
       },
       mobile:{
        type:String,
        required:true
       },
       password:{
        type:String,
        required:true
       },
       role:{
        type:String,
        enum:["admin","employee"],
         default:"admin"
       },
       image:{
            public_id:{
                type:String,
                default:""
            },
            securel_url:{
                type:String,
                default:""
            }
       },
       token:{
        type:String,
        default:""
       }
    },
    {
        timestamps:true
    }
)

  registrationSchema.pre("save",async function(next){
        if(!this.isModified("password")) return next();
        try{
            const salt=await bcrypt.genSalt(10);
            this.password=await bcrypt.hash(this.password,salt);
            next();
        }catch(err){
            next(err);
        }
  })
  


const registrationModel=model("Registyration",registrationSchema);


export {registrationModel};