const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
 //  "userRandomID": {
 //    id: "userRandomID",
 //    email: "user@example.com",
 //    password: "purple-monkey-dinosaur"
 //  },
 // "user2RandomID": {
 //    id: "user2RandomID",
 //    email: "user2@example.com",
 //    password: "dishwasher-funk"
 //  }
};

let templateVars = {
  urls: urlDatabase,
  user: users,
  currentUser: undefined
};

// GET: root address
app.get("/", (req, res) => {
  res.render("index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send("Status Code 404 - Not Found: The URL you requested for was not found");
  } else {
    res.redirect(302,longURL);
  }
});

// GET: local address containing the registration page
app.get("/register", (req, res) => {
  res.render("registration",templateVars);
})

// GET: local address containing the login page
app.get("/login", (req, res) => {
  res.render("login", templateVars);
})

// GET: local address containing URLs collection
app.get("/urls", (req, res) => {
  let localVars = templateVars;
  localVars.user_id = req.cookies.user_id;
  res.render("urls_index", templateVars);
});

// GET: new local address containing details for a shortened URL
app.get("/urls/new", (req, res) => {
  if (templateVars.currentUser === undefined) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

// GET: local address containing details for a shortened URL
app.get("/urls/:id", (req, res) => {
  let vars = templateVars ;
  vars["shortURL"] = req.params.id;
  res.render("urls_show", templateVars);
});

// POST: adds a new user object in the global users object
// then redirects user to /urls
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Status Code 400 - Bad Request: The email and/or password field is empty.");
    return;
  }
  for (user in users) {
    if ((users[user].email).toLowerCase() === req.body.email.toLowerCase()) {
      res.status(400).send("Status Code 400 - Bad Request: This email address is already registered.");
      return;
    }
  }
  const uniqueID = generateRandomString(8);
  users[uniqueID]          = {}
  users[uniqueID].id       = uniqueID;
  users[uniqueID].email    = req.body.email;
  users[uniqueID].password = req.body.password;
  res.cookie('user_id', uniqueID);
  templateVars.currentUser = users[uniqueID].email;
  res.redirect("/urls");
})


// POST: URL to URLs collection
app.post("/urls", (req, res) => {
  const newKey = generateRandomString(6);
  urlDatabase[newKey] = req.body.longURL;
  if (!urlDatabase[newKey].includes("http://") &&
    !urlDatabase[newKey].includes("https://")) {
    urlDatabase[newKey] = "http://" + urlDatabase[newKey];
  }
  res.redirect(`/urls/${newKey}`);
});

// POST: create cookie for inputted username, then
// redirects user to /urls
app.post("/login", (req, res) => {
  for (user in users) {
    if (users[user].email.toLowerCase() === req.body.email.toLowerCase()
      && users[user].password === req.body.password) {
      templateVars.currentUser = users[user].email;
      res.cookie('user_id', users[user].id);
      res.redirect("/");
      return
    }
  }
  res.status(403).send("Status Code 403 - Forbidden: The email or password is incorrect.");
  return;
});

// POST: logs the user out, and redirects user to /urls
app.post("/logout", (req, res) => {
  templateVars.currentUser = undefined;
  res.clearCookie("user_id");
  res.redirect("urls");
})

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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});

// Generates random string num characters long
function generateRandomString(num) {
  let text = '';
  const selection = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const strLength = num;
  for (let index = 0; index < num; index++) {
    text += selection.charAt(Math.floor(Math.random() * selection.length));
  }
  return text;
}