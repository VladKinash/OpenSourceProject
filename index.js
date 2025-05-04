const express = require('express');
const app = express();
const mysql = require('mysql2');
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use(express.json());
app.use(express.static('views'));
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'OpenSourceProject',
});

const db = pool.promise();
const port = 1000;

app.listen(port, () => {
    console.log("Server run on port "+ port);
})



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

app.post('/signup', async (req, res) => {
    try {
        const username = req.body.username; 
        const [users] = await db.query('SELECT * FROM users WHERE username='+username)
        if (users.length == 0){
            if (req.body.password == req.body.re_password){
                const [result] = await db.execute('INSERT INTO users (username, password) VALUES ('+username+', '+req.body.password+')');
            } else {
                res.render('/signup', {"error": "passwords do not match"});
            }
        } else {
            res.render('/signup', {"error": "user already exists"});
        }
    } catch (error){
        console.log(error);
    }
})

// Game Page

// Lobby ??

