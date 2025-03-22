import { model, Schema } from "mongoose";



const userSchema=new Schema(
    {
         name:{
            type:String
         }
    },
    {
        timestamps:true
    }
)


const userModel=model("Employee",userSchema)


export default userModel