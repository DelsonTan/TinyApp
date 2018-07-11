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


// GET root directory
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/u/:shortURL", (req, res) => {
  console.log("shortURL", req.params.shortURL)
  let longURL = urlDatabase[req.params.shortURL];
  console.log("longURL",longURL);
  if (!longURL) {
    res.status(404).send("Status Code: 404: The URL you requested for was not found");
  } else {
    res.redirect(302,longURL);
  }
});

// GET urls collection
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// POST url to urls collection
app.post("/urls", (req, res) => {
  console.log(req.body);
  if (!(req.body['longURL'].includes("www")
    || !req.body['longURL'].includes("http://")
    || !req.body['longURL'].includes("https://"))) {
    res.send("Entered an invalid URL, go back and try again. ");
  } else {
    const newKey = generateRandomString();
    urlDatabase[newKey] = req.body.longURL;
    res.redirect(`/urls/${newKey}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body[req.params.id];
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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