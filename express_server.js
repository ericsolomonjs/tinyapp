const express = require("express");

const app = express();
const PORT = 8080; // default port 8080

//set EJS as view engine
app.set("view engine", "ejs")
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

app.get("/urls_new", (req, res) => {
  res.render("urls_new");
});
//POST new url route
app.post("/urls/new", (req, res) => {
  let fnLongURL = res.longURL;
  console.log(req.body);
  res.statusCode = 200;
  urlDatabase[generateRandomString()] =  fnLongURL;
})

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});