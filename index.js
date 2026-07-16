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
    const data = await db.query("SELECT * FROM books ORDER BY note_date DESC");
    const books = data.rows;
    console.log("BOOKS: ", books);
    
    res.render("index.ejs", { books: books });
})

app.get("/add", (req, res) => {
    res.render("add.ejs", {book: null, action: "Add"});
})

app.post("/add", async (req, res) => {
    let { name, isbn, description, notes, rating } = req.body;
    console.log("BODY: ", req.body);
    let author, url;
    try {
        if (isbn) {
            url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            const response = await axios.get(`https://openlibrary.org/search.json?title=${name.toLowerCase()}&fields=author_name`);
            author = response.data.docs[0].author_name[0];
        } else {
            ({ url, author, isbn } = await getISBNandCover(name));

        }

        let d = new Date();
        let date = d.toISOString();
        
        console.log("DATE: ", date);
        console.log("ISBN: ", isbn, '\n', "author: ", author);
        let temp = name.split(" ");
        let upperName = "";
        for (let word of temp) {
            upperName += `${word[0].toUpperCase()}${word.substr(1, word.length - 1)}`;
            upperName += " ";
        }
        name = upperName;
        const newNote = await db.query("INSERT INTO books (title, author, isbn,  notes,  note_date, rating, cover, description) VALUES ($1, $2, $3, $4, $5, $6, $7,$8)",
            [name, author, isbn, notes, date, rating, url, description]
        )
        res.redirect("/");
    } catch (err) {
        console.log("Failed to fetch data: ", err.message);
        
    }
  
    
});
app.post("/view/:id", async (req, res) => {
    const id = req.body.id;
    console.log("BOOK ID: ", id);
    const data = await db.query
        ("SELECT * FROM books WHERE id = $1", [id]);
    const book = data.rows[0];
    console.log("BOOK: ", book);
    res.render("view.ejs", { book: book });
})

app.get("/view/:id", async (req, res) => {
    const id = req.params.id;
    console.log("BOOK ID: ", id);
    const data = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    const book = data.rows[0];
    console.log("BOOK: ", book);
    res.render("view.ejs", { book: book });
})

app.post("/sort", async (req, res) => {
    try {
            if (req.body.sort === "date") {
        res.redirect("/");
    }
    else if(req.body.sort === "rate"){
        const result = await db.query("SELECT * FROM books ORDER BY rating DESC");
                const books = result.rows;
                console.log("SORT BOOKS: ", books);
        res.render("index.ejs", { books: books });
    }
    } catch (err) {
        console.log("ERROR: ", err.message);
    }

})
app.post("/edit", async (req, res) => {
    
    try {
        const id = parseInt(req.body.edit);
        const result = await db.query("SELECT title, isbn, description, notes, rating, id FROM books WHERE id = $1;", [id]);
        const book = result.rows[0];

        console.log("result: ",book);



        res.render("add.ejs", { book: book, action: "Update" });

    } catch (err) {
        console.log("Error: ", err.message);
    }
})

app.post("/Update", async (req, res) => {

    const { description, notes, rating, update} = req.body;
    const d = new Date();
    console.log("body: ", req.body);
    console.log("UPDATE: ", update);
    console.log("Parsed: ", parseInt(update));
    await db.query(`UPDATE books SET  description = $1, notes = $2, rating = $3, note_date = $4 WHERE id = $5 `,
        [description, notes, rating, d.toISOString(), parseInt(update)]);
    
    res.redirect(`/view/${update}`);
})

app.post("/delete", async (req, res) => {
    const id = parseInt(req.body.id);
    console.log("ID: ", id);
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
})


app.listen(port, () => {
    console.log(`Listeneing to port ${port}`);
})