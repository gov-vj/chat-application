const path = require('path');
const express = require('express');
const moongose = require('mongoose');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const { getChatPage } = require('./controllers/chat');
const MongoStore = require('connect-mongo')(expressSession);
const { isAuthenticated } = require('./middleware/isAuthenticated');
const { loginFormValidator } = require('./middleware/loginFormValidator');
const { getLoginPage, registerUser, authenticateUser } = require('./controllers/login');

moongose.connect("mongodb://localhost:27017/chat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(res => console.log('connected to db'))
  .catch(error => console.error(error));

const db = moongose.connection;

const app = express();

app.use(expressSession({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/login', getLoginPage);
app.post('/login', loginFormValidator, authenticateUser);
app.post('/register', loginFormValidator, registerUser);
app.get('/chat', isAuthenticated, getChatPage);
app.use(function (err, req, res, next) {
  res.status(500).send('Server error');
});

app.listen(3000);