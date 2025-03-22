import { Schema } from "mongoose";


const attandanceSchema=new Schema(
    {
        data:{
            type:String,
            required:true
        },
        p1:{
            type:String,
            required:false
        }
    },
    {

    }
)