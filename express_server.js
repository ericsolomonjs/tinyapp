const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//set EJS as view engine
app.set("view engine", "ejs");
//middleware for decoding buffers
app.use(express.urlencoded({ extended: true }));
//middleware for parsing cookies
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).slice(6);
}

function duplUserChecker (reqBodyEmail, usersObj) {
  for (let user in usersObj) {
    if (user.email === reqBodyEmail) {
      return true;
    }
  }
  return false;
}

function getUserByEmail(email) {
  let fnUserObj = {} ;
  for (let user in users) {
    if (email === user.email) {
      fnUserObj = user;
    }
  }
  return fnUserObj;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
//GET /register // renders register page
app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies.user_id]
    };
    res.render("register", templateVars);
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
  
  
  if (req.body.email && req.body.password && !duplUserChecker(req.body.email, users))  {
    let randomId = generateRandomString();
    users[randomId] = {
      id : randomId,
      email : req.body.email,
      password : req.body.password
    };
    res.cookie("user_id", randomId);
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    console.log("registration error: invalid input");
    res.redirect("/register");
  };
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//GET /urls // render urls index and send templatevars;
app.get("/urls", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies.user_id]
    };
    console.log(templateVars);
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {
      urls: urlDatabase,
      user: null
    };
    res.render("urls_index", templateVars);
  }
});
//POST method for updating long url in links
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});
//GET /urls/new 
app.get("/urls/new", (req, res) => {
  let templateVars = {};
  if (req.cookies.user_id) {
    templateVars = { user : users[req.cookies.user_id] };
  } else {
    templateVars = { user : null };
  }

  res.render("urls_new", templateVars);
});
//POST new url route //adds longUrl to database;
app.post("/urls/new", (req, res) => {
  let fnLongURL = res.longURL;
  res.statusCode = 200;
  urlDatabase[generateRandomString()] = fnLongURL;
});
//Post /urls //creates a new shortUrl for input longUrl;
app.post("/urls", (req, res) => {
  res.statusCode = 200;
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL; // store the new short and long urls
  res.redirect("/urls/" + randomString); // redirect to the link's page
});
//POST /login // check if same cookie then clear and login
app.post("/login", (req, res) => {
  const fetchedUser = getUserByEmail(req.body.email);
  if (fetchedUser && fetchedUser.password === req.body.password) {
    res.cookie("user_id", fetchedUser.user_id);
    res.redirect("/urls");
  } else {
  }
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = { 
      user: users[req.cookies.user_id],
    };
    res.render("login", templateVars);
    
  } else {
    const templateVars = { 
      user: null,
      };
    res.render("login", templateVars);
  } 
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  if (req.cookies.user_id) {
    const templateVars = { 
      user: users[req.cookies.user_id],
      id: req.params.id,
      longURL: urlDatabase[req.params.id] 
    };
    res.render("urls_show", templateVars);
    
  } else {
    const templateVars = { 
      user: null,
      id: req.params.id,
      longURL: urlDatabase[req.params.id] 
      };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});