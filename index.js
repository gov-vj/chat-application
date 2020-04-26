const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { db } = require('./connectMongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { getChatPage } = require('./controllers/chat');
const { websocketHandler } = require('./websocketHandler.js');
const { isAuthenticated } = require('./middleware/isAuthenticated');
const { loginFormValidator } = require('./middleware/loginFormValidator');
const { getLoginPage, registerUser, authenticateUser } = require('./controllers/login');

const app = express();
const server = http.createServer(app);
const sessionParser = session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
});

const wss = websocketHandler(sessionParser, server);

app.use(sessionParser);
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/login', getLoginPage);
app.post('/login', loginFormValidator, authenticateUser);
app.post('/register', loginFormValidator, registerUser);
app.get('/chat', isAuthenticated, getChatPage);
app.use(function (err, req, res, next) {
  res.status(500).send('Server error');
});

server.listen(3000);