// import express from "express";
import dotenv from "dotenv"
// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js";
import connectDB from "./db/index.js";
import {app} from "./app.js"

dotenv.config({
    path: './.env'
})

// const app = express();

connectDB()
.then(()=>{
    app.on("error", (error) => {
        console.log("ERROR : ",error);
        throw error
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);        
    })
})
.catch((err) => {
    console.log("MONGO DB connection failed !!! ",err);    
})

/*  Second approach but not better than above one

(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        app.on("error",()=>{
            console.log("ERROR",error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ",error)
        throw error        
    }
})()
*/