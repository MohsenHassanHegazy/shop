const path = require('path');
const fs = require('fs');


const https =require('https');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const comp =require('compression');
const morgan =require('morgan');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
`${process.env.MONGO_USER}`;

const app = express();

// const key =fs.readFileSync('server.key');
// const cert =fs.readFileSync('server.cert');

console.log(process.env.MONGO_USER)

app.use(helmet());
app.use(comp());
app.use(morgan('combined'));

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();
let dat2 = new Date().toISOString().replace(':','-');
console.log(dat2);
let dat = dat2.replace(':','-');
console.log(dat);
dat+='-';
console.log(dat);
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null,dat+file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);s
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({storage: fileStorage}).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: 'qwertyuio',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.isLoggedIn
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    // https.createServer({key:key,cert:cert},app)
    app.listen(process.env.PORT||3000);
  })
  .catch(err => {
    console.log(err);
  });

