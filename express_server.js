const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  " 9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  res.redirect(URLPairToURL(addURLPair(req.body)));
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send("Status Code: 404: The URL you requested for was not found");
  } else {
    res.redirect(302,longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let text = '';
  const selection = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const strLength = 6;
  for (let index = 0; index < strLength; index++) {
    text += selection.charAt(Math.floor(Math.random() * selection.length));
  }
  return text;
}

// GIVEN: object containing a single key-value pair with:
// key   = longURL
// value = the long URL
// SIDE EFFECT: adds key-value pair to urlDatabase object where:
// key   = randomly generated string of characters of length 6
// value = the long URL value from the given key-value pair
// RETURNS: the key-value pair added to the database
function addURLPair(obj) {
  const shortURL = generateRandomString();
  let result = {};
  result[shortURL] = obj['longURL'];

  urlDatabase[shortURL] = result[shortURL];
  return result;
}

// GIVEN: object containing a single key-value pair with:
// key   = shortURL
// value = longURL
// SIDE EFFECT: none
// RETURN: string of the form 'http://localhost:8080/urls/<shortURL>'
function URLPairToURL(obj) {
  const objKey = Object.keys(obj)[0];
  return `http://localhost:8080/urls/${objKey}`;
}