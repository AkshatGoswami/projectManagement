import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
    override: true
});

import app from "./app.js";
import connectDB from "./db/index.js";

const port = process.env.PORT || 8000;

connectDB()
 .then( () => {
    app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
 })
 .catch((error) => {
    console.error("MongoDB connection error: ", error);
    process.exit(1);
 })

