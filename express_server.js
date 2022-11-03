const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//set EJS as view engine
app.set("view engine", "ejs");
//middleware for decoding buffers
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  return Math.random().toString(36).slice(6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});
//POST method for updating long url in links
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//POST new url route
app.post("/urls/new", (req, res) => {
  let fnLongURL = res.longURL;
  res.statusCode = 200;
  urlDatabase[generateRandomString()] =  fnLongURL;
})

app.post("/urls", (req, res) => {
  res.statusCode = 200;
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL; // store the new short and long urls
  res.redirect("/urls/"+randomString); // redirect to the link's page
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
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