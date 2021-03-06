require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const SECRET_SESSION = process.env.SECRET_SESSION;
const passport = require('./config/ppConfig');
const flash = require('connect-flash');
const methodOverride = require('method-override')

require('./utilities/spotifyApi')
//require the authorizarization middleware at the top of the page
const isLoggedIn = require('./middleware/isLoggedIn')

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

// secret: What we actually giving the user to use our site / session cookie
// resave: Save the session even if it's modified, make this false
// saveUninitialized: if we have a new session, we'll save it, therefore,
// setting this to true

app.use(session({
  secret: SECRET_SESSION,
  resave: false,
  saveUninitialized: true
}));

// Initialize passport and run session as middleware
app.use(passport.initialize());
app.use(passport.session());

// flash for temporary messages to the user
app.use(flash());//put flash after passport

//middleware to have out messages accessible for every view
app.use((req, res, next)=>{
  //before every route, we will attach our user to res.local
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next()
})

app.get('/', (req, res) => {
  res.render('index', { alerts: req.flash() });
});



app.use('/auth', require('./routes/auth'));
app.use('/track', isLoggedIn, require('./routes/track'));//mounting 
app.use('/comment', isLoggedIn, require('./routes/comment'))
app.use('/profile', isLoggedIn, require('./routes/profile'))

app.get('*', function(req, res){
  res.render('404');
});
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${port} 🎧`);
});

module.exports = server;