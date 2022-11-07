const cookieSession = require('cookie-session')
const express = require("express");
const bcrypt = require("bcryptjs");
const {getUserByEmail} = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

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

function generateRandomString() {
  return Math.random().toString(36).slice(6);
}

//find urls by user ID
function urlsForUser(id) {
  console.log("ID log start of fn ", id);//checked, works
  let fnUsers = {};
  for (let url in urlDatabase) {
    console.log('urlForUser(id) in for ', url)
    console.log('url user id ', urlDatabase[url].userID)
    if ( urlDatabase[url].userID === id ) {
      fnUsers[url] = urlDatabase[url];
      console.log('urlForUser(id) url added', fnUsers[url])
    }
  }
  return fnUsers                                                                                                                                                                                    ;
}

//function example for find object key by value
// function findObjectsKey(obj, value) {
//   return Object.keys(obj).find(key => obj[key] === value)
// }

// //return array of keys !
// function findObjectsByUserID(fnUrlDatabase, fnUserID) {
//   let keys = [];
//   for (let forObj in fnUrlDatabase) {
//     if (fnUrlDatabase.forObj.userID === fnUserID) {
//       keys.push(forObj);
//     }
//   }
//   return keys;
// }

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};

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
    if (req.body.email && req.body.password && !getUserByEmail(req.body.email).email, users) {
      let randomId = generateRandomString();
      let userHash = bcrypt.hashSync(req.body.password, 10);
      users[randomId] = {
        id : randomId,
        email : req.body.email,
        password : userHash
      };
      //console.log("registered new user",  users[randomId]);//checked,works
      req.session.user_id = randomId;
      res.redirect("/urls");
    } else {
      res.statusCode = 400;
      console.log("registration error: invalid input");
      res.redirect("/register");
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
    console.log(templateVars);
    res.render("urls_index", templateVars);
  } else {
    res.send("<html><body>You must log in to see your shortlinks. <a href=\"/login\">Login</a></body></html>\n");
  }
});

//POST method for updating long url in links
app.post("/urls/:id", (req, res) => {
  console.log(req.body.longURL);
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
    res.redirect("/login");
  }
});

//POST new url route //adds longUrl to database;
app.post("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let fnLongURL = res.longURL;
    res.statusCode = 200;
    urlDatabase[generateRandomString()] = {
      longURL: fnLongURL,
      userID: req.session.user_id
    };
  } else {
    console.log("must be logged in to create tinyURL")
    res.redirect("/login");
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
  const validPassword = bcrypt.compareSync(req.body.password, fetchedUser.password);
  if (fetchedUser && validPassword) {
    req.session.user_id = fetchedUser.id;
    res.redirect("/urls");
  } else {
    res.statusCode = 403;
    res.redirect("/login");
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
  console.log(req.params.id);
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