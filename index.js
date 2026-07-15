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

async function getISBNandCover(name) {
    const isbn_url = `https://openlibrary.org/search.json?title=${name.toLowerCase()}&fields=author_name,isbn`;
        try {
            const result = await axios.get(isbn_url);
            const isbn = result.data.docs[0].isbn[1];
            const author = result.data.docs[0].author_name[0];
            const cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
            return { url: cover_url, author: author, isbn: isbn };
        } catch (err) {
            console.log("Error making request: ", err);

        }
    

    
}
app.get('/', async (req, res) => {
    const data = await db.query("SELECT * FROM books");
    const books = data.rows;
    console.log("BOOKS: ", books);
    
    res.render("index.ejs", { books: books });
})

app.get("/add", (req, res) => {
    res.render("add.ejs");
})

app.post("/add", async (req, res) => {
    let { name, isbn, description, notes, rating  } = req.body;
    console.log("BODY: ", req.body);
    let author, url;
    try {
        if (isbn) {
            url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            const response = await axios.get(`https://openlibrary.org/search.json?title=${name.toLowerCase()}&fields=author_name`);
            author = response.data.docs[0].author_name[0];
        } else {
            ({url, author, isbn} = await getISBNandCover(name));

        }

        let d = new Date();
        let date = d.toISOString();
        
        console.log("DATE: ", date);
        console.log("ISBN: ", isbn, '\n', "author: ", author);
        const newNote = await db.query("INSERT INTO books (title, author, isbn,  notes,  note_date, rating, cover, description) VALUES ($1, $2, $3, $4, $5, $6, $7,$8)",
            [name, author, isbn,notes , date ,rating, url, description  ]
        )
        res.redirect("/");
    } catch (err) {
        console.log("Failed to fetch data: ", err.message);
        
    }
  
    
})





app.listen(port, () => {
    console.log(`Listeneing to port ${port}`);
})