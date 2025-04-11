import { model, Model,Schema } from "mongoose";
import { type } from "os";


const policeSchema=new Schema(
    {
            titel:{
                require:true,
                type:String
            },
            description:{
                require:true,
                type:String
            }
    },
    {
        timestamps:true
    }
)

const policeModel=model("Policy",policeSchema)

export default policeModel;