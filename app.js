const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

// initialize app & middleware
const app = express();
app.use(express.json()); //parse any JSON coming in

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
    //current page
    const page = req.query.p || 0;
    const booksPerPage = 1;

    let books = [];
    //db.books in mongosh
    db.collection('books')
        .find() //cursor toArray forEach
        .sort({ author: 1 })
        .skip(page * booksPerPage)
        .limit(booksPerPage)
        .forEach(book => books.push(book)) //ASYNC
        .then(() => {
            res.status(200).json(books);
        })
        .catch(err => {
            res.status(500).json({ error: 'Could not fetch data' })
        })
})

app.get('/books/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .findOne({ _id: ObjectId(req.params.id) })
            .then(doc => {
                res.status(200).json(doc)
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not fetch data' })
            })
    } else {
        res.status(400).json({ error: 'Invalid document id' })
    }
})

app.get('/', (req, res) => {
    res.send("hello");
})

app.post('/books', (req, res) => {
    //need express.json middleware -> see line 7
    console.log('Post req incoming');
    const book = req.body;
    db.collection('books')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            res.status(500).json({ error: 'Could not create a new doc' })
        })
})

app.delete('/books/:id', (req, res) => {
    console.log('Del req inc');
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not delete data' })
            })
    } else {
        res.status(400).json({ error: 'Invalid document id' })
    }
})

app.patch('/books/:id', (req, res) => {
    console.log('Patch req inc');
    const updates = req.body;
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .updateOne({ _id: ObjectId(req.params.id) }, {$set: updates})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not update data' })
            })
    } else {
        res.status(400).json({ error: 'Invalid document id' })
    }
})