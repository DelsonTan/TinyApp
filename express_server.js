const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user: "3ns8dA"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user: "K49kds"
  }
};

let users = {
  "3ns8dA": {
    id: "3ns8dA",
    email: "user1@user.com",
    password: "purple-monkey-dinosaur"
  },
 "K49kds": {
    id: "K49kds",
    email: "user2@user.com",
    password: "dishwasher-funk"
  }
};

function templateVars(cookie_user_id) {
  return {
    urls: urlDatabase,
    user: users,
    currentUser: cookie_user_id
  };
}

// GET: root address
app.get("/", (req, res) => {
  res.render("index", templateVars(req.cookies.user_id));
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params["shortURL"]]) {
    res.status(404).send("Status Code 404 - Not Found: The URL you requested for was not found");
    return;
  }
  let longURL = urlDatabase[req.params["shortURL"]].longURL;
  res.redirect(302, longURL);
  })

// GET: local address containing the registration page
app.get("/register", (req, res) => {
  res.render("registration",templateVars(req.cookies.user_id));
})

// GET: local address containing the login page
app.get("/login", (req, res) => {
  res.render("login", templateVars(req.cookies.user_id));
})

// GET: local address containing URLs collection
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_index", urlsForUser(req.cookies.user_id));
});

// GET: new local address containing details for a shortened URL
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id === undefined) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars(req.cookies.user_id));
});

// GET: local address containing details for a shortened URL
app.get("/urls/:id", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
    return;
  }
  if (req.cookies.user_id !== urlDatabase[req.params.id].id) {
    res.redirect("/urls");
    return;
  }

  let vars = templateVars ;
  vars["shortURL"] = req.params.id;
  res.render("urls_show", templateVars(req.cookies("user_id")));
});

// POST: adds a new user object in the global users object
// then redirects user to /urls
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Status Code 400 - Bad Request: The email and/or password field is empty.");
    return;
  }
  for (let user in users) {
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
  res.redirect("/urls");
})


// POST: URL to URLs collection
app.post("/urls", (req, res) => {
  const newKey = generateRandomString(6);
  let newURL = req.body.longURL;
  if (!newURL.includes("http://") && !newURL.includes("https://")) {
    newURL = "http://" + newURL;
  }
  urlDatabase[newKey] = {};
  urlDatabase[newKey].longURL = newURL;
  urlDatabase[newKey].user = req.cookies.user_id;
  console.log(urlDatabase);
  res.redirect(`/urls/${newKey}`);
});

// POST: create cookie for inputted username, then
// redirects user to /urls
app.post("/login", (req, res) => {
  for (let user in users) {
    if (users[user].email.toLowerCase() === req.body.email.toLowerCase()
      && users[user].password === req.body.password) {
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
  if (!req.cookies.user_id) {
    res.redirect("/login");
    return;
  }
  if (urlDatabase[req.params.id].user === req.cookies.user_id) {
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

// PUT: updates long URL value for inputted short URL key to a new value
app.post("/urls/:id/update", (req, res) => {
  const newShort = req.params.id;
  urlDatabase[shortURL] = req.body[newShort];
  if (!urlDatabase[newShort].includes("http://") &&
    !urlDatabase[newShort].includes("https://")) {
    urlDatabase[newShort].longURL = "http://" + urlDatabase[shortURL];
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

function urlsForUser(id) {
  let newTemplateVars = {};
  newTemplateVars.urls = {};
  for (shortURL in urlDatabase) {
    if (urlDatabase[shortURL].user === id) {
      newTemplateVars.urls[shortURL] = urlDatabase[shortURL];
    }
  }

  newTemplateVars.user = users;
  newTemplateVars.currentUser = id;
  return newTemplateVars;
}