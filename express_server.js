const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const bcrypt = require('bcrypt');
const saltRounds = 12;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"]
}));

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
    password: "$2b$12$t9zpRfXxPV70sbUtM4AQ6epm/RlQGYA5KILc9Icvivs19H97nF0UW" // "purple-monkey-dinosaur"
  },
  "K49kds": {
    id: "K49kds",
    email: "user2@user.com",
    password: "$2b$12$YExU3sSoUu1iwbC.UOl0zuAnVxTQAkx7m9CR5uuxQzvo0aOKdBILS" //  "dishwasher-funk"
  }
};

function templateVars(cookie_user_id) {
  return {
    urls: urlDatabase,
    user: users,
    currentUser: cookie_user_id
  };
}

// GET: endpoint for root address
// REDIRECT to /urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// GET: endpoint for /u/:shortURL
// IF: shortURL does not exist in url database,
// THEN: SEND to HTML page with error code 404
// ELSE: REDIRECT to corresponding longURL value shortURL is the key for
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params["shortURL"]]) {
    res.status(404).send("Status Code 404 - Not Found: The URL you requested for was not found");
    return;
  }
  let longURL = urlDatabase[req.params["shortURL"]].longURL;
  res.redirect(302, longURL);
})

// GET: endpoint for /register
// RENDER: registration.ejs, with template variables
app.get("/register", (req, res) => {
  res.render("registration", templateVars(req.session.user_id));
})

// GET: endpoint for /login
// RENDER: login.ejs, with template variables
app.get("/login", (req, res) => {
  res.render("login", templateVars(req.session.user_id));
})

// GET: endpoint for /urls
// IF: request did not pass a cookie identified as user_id
// THEN: REDIRECT to /login
// ELSE: RENDER /urls_index, with only URLs from urlDatabase
//       the user has made
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_index", urlsForUser(req.session.user_id));
});

// GET: endpoint for /urls/new
// IF: request did not pass a cookie identified as user_id
// THEN: REDIRECT to login
// ELSE: RENDER /urls/new, with template variables
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars(req.session.user_id));
});

// GET: endpoint for /urls/:id
// RENDER /urls/show if successful, with template variables
app.get("/urls/:id", (req, res) => {
  // IF: request did not pass a cookie identified as user_id, redirect to /login
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  // Checks urlDatabase for whether the inputted shortURL exists
  for (let shortURL in urlDatabase) {
    if (req.params.id === shortURL) {
      // IF: user_id cookie does not match the id value for the passed id parameter,
      // redirect to /urls
      if (req.session.user_id !== urlDatabase[req.params.id].id) {
        res.redirect("/urls");
        return;
      }
      let vars = templateVars;
      vars["shortURL"] = req.params.id;
      res.render("urls_show", templateVars(req.cookies("user_id")));
      return;
    }
  }
  // Matching shortURL was not found
  res.status(404).send("Status Code 404 - Not Found: The URL you requested for was not found");
});

// POST: handler for adding new user object in the users database
// REDIRECT to /urls if successful
app.post("/register", (req, res) => {
  // IF: email and/or password field is empty
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Status Code 400 - Bad Request: The email and/or password field is empty.");
    return;
  }
  // IF: inputted email did not match any user in the users database(case insensitive)
  for (let user in users) {
    if ((users[user].email).toLowerCase() === req.body.email.toLowerCase()) {
      res.status(400).send("Status Code 400 - Bad Request: This email address is already registered.");
      return;
    }
  }
  const uniqueID = generateRandomString(8);
  users[uniqueID] = {}
  users[uniqueID].id = uniqueID;
  users[uniqueID].email = req.body.email;
  users[uniqueID].password = bcrypt.hashSync(req.body.password, saltRounds);
  req.session.user_id = uniqueID;
  res.redirect("/urls");
})


// POST: handler for adding a new URL to URLs collection
// REDIRECT to new /urls/:shortURL
// ASSUME: user enters a valid URL 
app.post("/urls", (req, res) => {
  const newKey = generateRandomString(6);
  let newURL = req.body.longURL;
  if (!newURL.includes("http://") && !newURL.includes("https://")) {
    newURL = "http://" + newURL;
  }
  urlDatabase[newKey] = {};
  urlDatabase[newKey].longURL = newURL;
  urlDatabase[newKey].user = req.session.user_id;
  res.redirect(`/urls/${newKey}`);
});

// POST: handler for logging the user in
// REDIRECTS user to /urls
app.post("/login", (req, res) => {
  // IF: email and/or password fields are empty, SEND to html page with error code 400
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Status Code 400 - Bad Request: The email and/or password field is empty.");
    return;
  }
  // IF: inputted email and password do not match any users, REDIRECT to /
  for (let user in users) {
    if (users[user].email.toLowerCase() === req.body.email.toLowerCase()
      && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect("/");
      return
    }
  }
  res.status(403).send("Status Code 403 - Forbidden: The email or password is incorrect.");
  return;
});

// POST: handler for logging the user out
// REDIRECT to /urls
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

// DELETE: handler for deleting URL from URL collection
// REDIRECT to /urls
app.post("/urls/:id/delete", (req, res) => {
  // IF: user is not logged in, REDIRECT to /login
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  // IF: user created this shortURL, delete is successful
  if (urlDatabase[req.params.id].user === req.session.user_id) {
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

// PUT: handler for updating long URL value for inputted short URL key to a new value
// REDIRECT to /urls
// ASSUME: entered URL is valid
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

// GIVEN a number, RETURNS generated random-looking string num characters long
// ASSUME: each generated number will be unique
function generateRandomString(num) {
  let text = '';
  const selection = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const strLength = num;
  for (let index = 0; index < num; index++) {
    text += selection.charAt(Math.floor(Math.random() * selection.length));
  }
  return text;
}

// GIVEN a string that should contain the user ID, RETURNS new set of template variables 
// containing only URLs in urlDatabase created by the user
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
