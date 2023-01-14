const express = require('express');
const { connectToDb, getDb } = require('./db');

// initialize app & middleware
const app = express();

//db connection
let db;

connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log(`Server live on http://localhost:3000`);
        })
        db = getDb();
    }
})


// routes

app.get('/books', (req, res) => {
    let books = [];
    //db.books in mongosh
    db.collection('books')
        .find() //cursor toArray forEach
        .sort({ author: 1 })
        .forEach(book => books.push(book)) //ASYNC
        .then(() => {
            res.status(200).json(books);
        })
        .catch(err => {
            res.status(500).json({ error: 'Could not fetch data' })
        })


})

app.get('/', (req, res) => {
    res.send("hello");
})