import { model, Schema } from "mongoose";
import { type } from "os";


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
        // role:{
        //     type:String,
        //     enum:["employee","manager","admin"],
        //     default:"employee"
        // },
        addtional1:{
            type:String,
            default:""
        },
        addtional2:{
            type:String,
            default:""
        },
        addtional3:{
            type:String,
            default:""
        }
    },
    {
      timestamps:true
    }
)


const employeModel=model("Employee",employeeSchema)


export default employeModel