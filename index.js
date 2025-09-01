import express from  "express"
import cors from 'cors'
import { adminRouter } from "./Routes/AdminRoute.js"   
import path from 'path'
import { EmployeeRouter } from "./Routes/EmployeeRoutes.js"
import  Jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import { TaskRouter } from './Routes/TaskRoutes.js';

const app =express()

app.use(cookieParser())

app.use(cors({
  origin: ['https://ems-frontend-delta-nine.vercel.app', 'http://localhost:5173'],
  methods : ['GET','POST','PUT','DELETE'],
  credentials: true,
    optionsSuccessStatus: 200, // sometimes needed for legacy browsers
}));


app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});
app.use(express.json())
app.use('/auth',adminRouter)
app.use('/employee', EmployeeRouter)
app.use('/task', TaskRouter);
app.options('*', cors()); // enable preflight for all routes


const verifyUser =((req,res,next)=>{
    console.log("Thisis response" , res)
    const token =req.cookies.token;
    if(token){
        Jwt.verify(token , "jwt_secret_key" ,(err,decoded)=>{
            if(err) return res.json({Status:false , Error : "wrong Credentials"})
             req.id = decoded.id;
            req.role = decoded.role;
            next();
        })
    }

    else{
        return res.json({Status :false , Error : "Not authenticated"})
    }
    
})
app.get('/verify',verifyUser , (req,res)=>{
    console.log(res)
    return res.json({Status:true , role : req.role , id : req.id})
})

 app.listen(3000 , ()=>{
    console.log("server is running")
})
