const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use(express.json());
app.use(express.static('views'));

const port = 1000;

app.get('/', (req, res) => {
    res.redirect('/login');
})

// login Page

app.get('/login', (req, res) => {
    res.render('pages/login');
})

// signup Page

app.get('/signup', (req, res) => {
    res.render('pages/signup');
})

// Game Page

// Lobby ??

app.listen(port, () => {
    console.log("Server run on port "+ port);
})