import dotenv from "dotenv"

dotenv.config({
    path: "./.env",
    override: true
});

import express from "express";

const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Hello World");
});
app.get("/instagram", (req, res) => {
    res.send("Welcome to Instagram page");
});
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});

let mydatabase = process.env.username;
console.log("Database: ", mydatabase);

console.log("Backend Project 3");
