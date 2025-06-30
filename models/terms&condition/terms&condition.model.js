import { Schema,model} from "mongoose";

const termsSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

  const termsModel= model("Terms", termsSchema);


  export default termsModel