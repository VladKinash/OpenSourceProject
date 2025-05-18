const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const port = 1000;

app.use(session({
  secret: 'your-secret-here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('views'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const pool = mysql.createPool({
    host: '85.75.160.83',
    user: 'guest',
    password: 'Nopass123!',
    database: 'OpenSourceProject',
    port: 3306, 
});

const db = pool.promise();

const { games } = require('./engine/server');

app.get('/', (req, res) => {
  res.redirect('/login');
});

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
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('pages/login', { error: 'Invalid username or password.' });
    }
    req.session.user = { id: user.id, name: user.username };
    return res.redirect('/home');
  } catch (err) {
    console.error(err);
    return res.render('pages/login', { error: 'Server error. Please try again.' });
  }
});

app.get('/signup', (req, res) => {
  res.render('pages/signup', { error: null });
});

app.post('/signup', async (req, res) => {
  const { username, password, re_password, email } = req.body;
  if (!username || !password || !re_password || !email) {
    return res.render('pages/signup', { error: 'All fields are required.' });
  }
  if (password !== re_password) {
    return res.render('pages/signup', { error: 'Passwords do not match.' });
  }
  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) {
      return res.render('pages/signup', { error: 'Username already exists.' });
    }
    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
      [username, hash, 'player', email]
    );
    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    return res.render('pages/signup', { error: 'Server error. Please try again.' });
  }
});

app.get('/home', requireAuth, (req, res) => {
  const rooms = Array.from(games.keys());
  res.render('pages/home', { rooms });
});

app.get('/lobby/:lobbyName', requireAuth, (req, res) => {
  res.render('pages/lobby', { lobby: req.params.lobbyName });
});

app.get('/room/:lobbyName', requireAuth, (req, res) => {
  const users = games.get(req.params.lobbyName)?.game.players.map(p => p.name) || [];
  res.render('pages/room', {
    room: req.params.lobbyName,
    users
  });
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
