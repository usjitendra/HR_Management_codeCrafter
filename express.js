import dotenv from "dotenv";
import express from'express'
import cors from 'cors'
import route from "./routes/route.js";
import bodyParser from 'body-parser'
import multer from 'multer';
import dbConnection from "./config/dbConnection.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import employeRoute from "./routes/employe.routes.js";


const app=express();
dotenv.config();

app.use(cors());
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api',route)
app.use("/api/v1/employee/attandance",employeRoute)

app.get('/',(req,res)=>{
      try{
           console.log("request++ successfully");
            return res.status(200).json({message:"suceesss"})
      }catch(err){
        return res.send({status:500,message:err.message});
      }
})

app.get("checking")
app.get("/chcking21")



app.use("*", (req, res) => {
    return res.status(404).json({ Message: "Route not found", path: req.originalUrl, method: req.method });
});


app.use(errorMiddleware)


const PORT=process.env.PORT||6000;
console.log(PORT);

app.listen(PORT,async()=>{
    await dbConnection()
    console.log(`server start on port ${PORT}`);
})




