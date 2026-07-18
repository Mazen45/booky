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
            console.log("RESULT: ", result);
            if (result.data.docs.length !== 0) {
                const isbn = result.data.docs[0].isbn[1];
                const author = result.data.docs[0].author_name[0];
                const cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
                return { url: cover_url, author: author, isbn: isbn };                
            } else {
                return null;
            }

        } catch (err) {
            console.log("Error making request: ", err);

        }
    

    
}
app.get('/', async (req, res) => {
    try {
        const sort = req.query.sort;
        if (!sort || sort === 'date') {
            const data = await db.query("SELECT * FROM books ORDER BY note_date DESC");
            const books = data.rows;        
            res.render("index.ejs", { books: books });
        } else if (sort === 'rating') {
            const data = await db.query("SELECT * FROM books ORDER BY rating DESC");
            const books = data.rows;
            res.render("index.ejs", { books: books });

        }


    } catch (error) {
        console.log("Error: ", error.message);
    }
})

app.get("/add", (req, res) => {
    res.render("add.ejs", {book: null, action: "Add"});
})

app.post("/add", async (req, res) => {
    let { title, isbn, description, notes, rating } = req.body;
    let author, url;
    const book = { title: title, description: description, notes: notes, rating: rating };
    console.log(book);
    try {
        if (!(title && description && notes && rating)) {
            return res.render("add.ejs", {book: book, action:"Add", error: "Please fill in all required fields before submitting."})
        } else {
            
            if (isbn) {
                url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
                const response = await axios.get(`https://openlibrary.org/search.json?title=${title.toLowerCase()}&fields=author_name`);
                console.log("RESPONSE: ", response);
                author = response.data.docs[0].author_name[0];
            } else {
                const result = await getISBNandCover(title);
                console.log("RESULT: ", result);
                if (!result) {
                    return res.render("add.ejs", { book: book, action: "Add", error: "Please enter a valid book name" });
                }
                else {
                    author = result.author;
                    url = result.url;
                    isbn = result.isbn;
                }

            }
            
            let d = new Date();
            let date = d.toLocaleDateString('en-CA');
            
            let temp = title.split(" ");
            let upperName = "";
            for (let word of temp) {
                upperName += `${word[0].toUpperCase()}${word.substr(1, word.length - 1)}`;
                upperName += " ";
            }
            title = upperName;
            const newNote = await db.query("INSERT INTO books (title, author, isbn,  notes,  note_date, rating, cover, description) VALUES ($1, $2, $3, $4, $5, $6, $7,$8)",
                [title, author, isbn, notes, date, rating, url, description]
            )
            res.redirect("/");
        }
    } catch (err) {
        console.log("Failed to fetch data: ", err.message);
        
    }
  
    
});
app.post("/view/:id", async (req, res) => {
    try {
            const id = req.body.id;
    const data = await db.query
        ("SELECT * FROM books WHERE id = $1", [id]);
    const book = data.rows[0];
    res.render("view.ejs", { book: book });
    } catch (error) {
        console.log("Failed to fetch data: ", error.message);

    }

})

app.get("/view/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = await db.query("SELECT * FROM books WHERE id = $1", [id]);
        const book = data.rows[0];
        res.render("view.ejs", { book: book });
    } catch (error) {
        
    }

})


app.post("/edit", async (req, res) => {
    
    try {
        const id = parseInt(req.body.edit);
        const result = await db.query("SELECT title, isbn, description, notes, rating, id FROM books WHERE id = $1;", [id]);
        const book = result.rows[0];
        res.render("add.ejs", { book: book, action: "Update" });

    } catch (err) {
        console.log("Error: ", err.message);
    }
})

app.post("/Update", async (req, res) => {

    const { description, notes, rating, update} = req.body;
    const d = new Date().toLocaleDateString('en-CA');
    await db.query(`UPDATE books SET  description = $1, notes = $2, rating = $3, note_date = $4 WHERE id = $5 `,
        [description, notes, rating, d, parseInt(update)]);
    
    res.redirect(`/view/${update}`);
})

app.post("/delete", async (req, res) => {
    const id = parseInt(req.body.id);
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
})


app.listen(port, () => {
    console.log(`Listeneing to port ${port}`);
})