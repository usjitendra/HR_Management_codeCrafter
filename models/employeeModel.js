import { model, Schema } from "mongoose";
import { type } from "os";
import bcrypt from 'bcryptjs';

const employeeSchema=new Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            require:true,
            trim:true
        },
        phone:{
            type:Number,
            require:true,
            trim:true
        },
        department:{
            type:String,
            require:true,
            trim:true
        },
        designation:{
            type:String,
            require:true,
            trim:true
        },
        salary:{
            type:String,
            require:true,
            trim:true
        },
        joiningDate:{
            type:Date,
            require:true,
            trim:true
        },
        employImage:{
            public_id:{
                type:String,
                default:""
            },
            secure_url:{
                type:String,
                default:""
            }
        },
        role:{
            type:String,
            enum:["employee","manager","admin"],
            default:"employee",
        },
        password:{
            type:String,
            require:true,
            trim:true
        },
        token:{
            type:String,
            default:""
        },
        addtional3:{
            type:String,
        },
        addtional4:{
            type:String,
        },
        addtional5:{
            type:String,
        },
        
        // addtional6:{
        //     type:String,
        //     default:"",
        //     enum:["false","true","default"]
        // }
    },
    {
      timestamps:true
    }
)


employeeSchema.pre("save",async function (next) {
      if(!this.isModified("password")) return next()
        try{
                const salt=await bcrypt.genSalt(10)
                this.password=await bcrypt.hash(this.password,salt);
                next();
    }catch(err){
        next(err)
    }
  })

const employeModel=model("Employee",employeeSchema)


export default employeModel