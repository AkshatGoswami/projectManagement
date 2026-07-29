import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


//basic configuration
app.use(cookieParser());
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(express.static("public"));
//cors configuration
app.use(cors({ 
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",   
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH","DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type", "Authorisation"]
 }));
// import the routes
import healthCheckRouter from "./routes/healthCheck.router.js";
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
// use the routes
app.use("/api/v1/auth", authRouter);
    // use the routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/projects", projectRouter);

app.get("/", (req,res) => {
    res.send("Welcome to project management system!");
});



export default app;                                                                                                         