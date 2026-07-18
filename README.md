# Booky

A simple web app that serves as a notebook for readers.
Users can Add their notes from books they have read.

## About

Booky uses [openlibrary.org] (https://openlibrary.org/developers/api#api-index) API's to fetch books ISBNs and authors, then books covers,  based on the name of the book users enter, and displays them in a user-friendly way. The website allows users to add, update and delete books. It also allows them to sort books based on rating and date of last modification.


## Tech Stack

- **Node.js** - runtime environment
- **Express** - web server and routing
- **Postgres** - database
- **EJS** - server-side templating
- **Axios** - HTTP client for API requests
- **CSS** - Styling

## How It Works

1. User adds the name of the book which they want to add notes of, isbn (optional), description, notes and rating.
2. Express server makes a GET request to `https://openlibrary.org/dev/docs/api/search` via Axios.
3. API returns a JS object containing the ISBN of the book and other information based on book's name.
4. Book cover is fetched based on the ISBN of the book and displayed to the user with the data they provided.

### Installation 

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/download/) (v13 or higher recommended)
- npm (comes bundled with Node.js)

### 1. Clone the repository
```bash
git clone https://github.com/Mazen45/booky.git
cd booky
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the PostgreSQL database
Create a new database and user:
```bash
sudo -iu postgres psql
```
```sql
CREATE USER booky_user WITH PASSWORD 'your_password';
CREATE DATABASE booky OWNER booky_user;
\q
```

Create the required table(s):
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    description TEXT,
    notes TEXT,
    rating INTEGER,
    cover VARCHAR(500),
    note_date DATE DEFAULT CURRENT_DATE
);
```


### 4. Configure environment variables
Create a `.env` file in the project root:
```env
DB_USER=booky_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=booky_db
```

### 5. Run the application
```bash
node index.js
```
The app will be running at [http://localhost:3000](http://localhost:3000) (or whichever port you've configured).

