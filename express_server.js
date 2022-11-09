///////////////// REQUIRES /////////////////
const cookieSession = require('cookie-session')
const express = require("express");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser
} = require("./assets");
///////////////// RESOURCES /////////////////
const users = new require("./assets").users;
const urlDatabase = new require("./assets").urlDatabase;
///////////////// NETWORKING /////////////////
const PORT = 8080; // default port 8080
///////////////// APP SETTINGS /////////////////
const app = express();
//set EJS as view engine
app.set("view engine", "ejs");
//middleware for decoding buffers
app.use(express.urlencoded({ extended: true }));
//middleware for parsing cookies
app.use(cookieSession({
  name: 'session',
  keys: ["secret.key"],
  //options
  maxAge: 24 * 60 * 60 * 1000 //results in 24h maxAge
}));
///////////////// ROUTES /////////////////

app.get("/", (req, res) => {
  res.send("Hello!");
});
//GET /register // renders register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    req.session.user_id = '';
    res.redirect("/urls");
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: null
    };
    res.render("register", templateVars);
  }
});
//POST /register // adds new email and pw to users /w randomID
app.post("/register", (req, res) => {
  if (!req.session.user_id) {
    if ((getUserByEmail(req.body.email, users) === undefined) && req.body.email && req.body.password)  {
      let randomId = generateRandomString();
      let userHash = bcrypt.hashSync(req.body.password, 10);
      users[randomId] = {
        id : randomId,
        email : req.body.email,
        password : userHash
      };
      req.session.user_id = randomId;
      res.redirect("/urls");
    } else {
      res.statusCode = 400;
      console.log("registration error: invalid input");
    };
}
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//GET /urls // render urls index and send templatevars;
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    usersUrls = urlsForUser(req.session.user_id);
    const templateVars = {
      urls: usersUrls,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("<html><body>You must log in to see your shortlinks. <a href=\"/login\">Login</a></body></html>\n");
  }
});

//POST method for updating long url in links
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls/");
});

//GET /urls/new 
app.get("/urls/new", (req, res) => {
  let templateVars = {};
  if (req.session.user_id && users[req.session.user_id]) {
    templateVars = { user : users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.send("<html><body>You must log in to create shortlinks. <a href=\"/login\">Login</a></body></html>\n");
  }
});

//POST new url route //adds longUrl to database;
app.post("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let fnLongURL = req.body.longURL;
    res.statusCode = 200;
    urlDatabase[generateRandomString()] = {
      longURL: fnLongURL,
      userID: req.session.user_id
    };
  } else {
    res.send("You must be logged in to create a tinyURL <a href=\"/login\">Login</a></body></html>\n")
    console.log("must be logged in to create tinyURL")
  }
  
});
//Post /urls //creates a new shortUrl for input longUrl;
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    res.statusCode = 200;
  let randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }; 
  res.redirect("/urls/" + randomString); 
  } else {
    res.send("<html><body>You must log in to create a new shortlink. <a href=\"/login\">Login</a></body></html>\n");
  } 
  // redirect to the link's page
});

//POST /login // fetch user by email and compare passwords before assign cookie
app.post("/login", (req, res) => {
  const fetchedUser = getUserByEmail(req.body.email, users);
  let validPassword;
  console.log("fetched user: ", fetchedUser);
  if (fetchedUser) {
    validPassword = bcrypt.compareSync(req.body.password, fetchedUser.password);
    if (validPassword) {
      req.session.user_id = fetchedUser.id;
      res.redirect("/urls");
    } else {
      res.statusCode = 403;
    }
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: null };
    res.render("login", templateVars);
  } 
});

app.post("/logout", (req, res) => {
  req.session.user_id = '';
  res.redirect("/login");
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send("you may not delete links that dont belong to you")
  }
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.end("This link does not belong to you.")
  } 

  if (req.session.user_id && users[req.session.user_id])  {
    const templateVars = { 
      user: users[req.session.user_id],
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL
    };
    res.render("urls_show", templateVars);
    
  } else {
    const templateVars = { 
      user: null,
      id: null,
      longURL: null
      };
    res.send("You have to be logged in to use this functionality");
  }
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.send("<html><body>Invalid short link specified</body></html>\n");
  } 
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});