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
        required:true,
       },
       mobile:{
        type:String,
       },
       password:{
        type:String,
       },
       role:{
        type:String,
        enum:["Admin","employee"],
        require:true
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
  
  registrationSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    
    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update); // update object must be updated manually
    }
  
    next();
  });
  

const registrationModel=model("Registration",registrationSchema);


export {registrationModel};