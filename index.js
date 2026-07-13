//importing libraries
import express from "express";
import axios from "axios";
import pg from "pg";


const app = express();
const port = 3000;

//Connecting to database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booky",
    password: "codb.123",
    port: 5432
});



//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


db.connect();


app.get('/', (req, res) => {
    res.render("index.ejs");
})

app.get("/add", (req, res) => {
    res.render("add.ejs");
})





app.listen(port, () => {
    console.log(`Listeneing to port ${port}`);
})