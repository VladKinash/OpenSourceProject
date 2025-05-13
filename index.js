const express = require('express');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use(express.json());
app.use(express.static('views'));
app.set('views', path.join(__dirname, 'views'));
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
    res.render('pages/login', { error: null });
  });

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
        return res.render('pages/login', { error: 'Invalid username or password.' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('pages/login', { error: 'Invalid username or password.' });
        }
        // Redirect on successful login
        res.redirect('home');
    } catch (err) {
        console.error(err);
        res.render('pages/login', { error: 'Server error. Please try again.' });
    }
});

// signup Page

app.get('/signup', (req, res) => {
    res.render('pages/signup', {error: null});
});

app.post('/signup', async (req, res) => {
    const { username, password, re_password } = req.body;
    if (!username || !password || !re_password) {
      return res.render('pages/signup', { error: 'All fields are required.' });
    }
    if (password !== re_password) {
      return res.render('pages/signup', { error: 'Passwords do not match.' });
    }
    try {
      const [users] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
      if (users.length > 0) {
        return res.render('pages/signup', { error: 'Username already exists.' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, 'player']);
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      
    }
});

app.get('/home', (req, res) => {
    res.render('pages/home');
});

app.get('/lobby/:lobbyName', (req, res) => {
  const lobbyName = req.params.lobbyName;
  res.render('pages/lobby', {lobby: lobbyName,});
});

app.get('/room/:lobbyName', (req, res) => {
  const lobbyName = req.params.lobbyName;
  res.render('pages/room', {room: lobbyName,users:['user1', 'user2', 'user3']});
});

// Game Page

// Lobby ??

