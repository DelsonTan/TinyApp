const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// GET: root address
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send("Status Code: 404: The URL you requested for was not found");
  } else {
    res.redirect(302,longURL);
  }
});

// GET: local address containing URLs collection
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// POST: new local address containing details for a shortned URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// POST: URL to URLs collection
app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  if (!urlDatabase[newKey].includes("http://") &&
    !urlDatabase[newKey].includes("https://")) {
    urlDatabase[newKey] = "http://" + urlDatabase[newKey];
  }
  res.redirect(`/urls/${newKey}`);
});

// DELETE: URL from URL collection
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// PUT: updates long URL value for inputted short URL key to a new value
app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body[shortURL];
  if (!urlDatabase[shortURL].includes("http://") &&
    !urlDatabase[shortURL].includes("https://")) {
    urlDatabase[shortURL] = "http://" + urlDatabase[shortURL];
  }
  res.redirect('/urls');
});


// GET: local address containing details for a shortened URL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
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