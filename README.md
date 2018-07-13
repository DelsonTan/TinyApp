# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product
!["Registration Page"](https://github.com/DelsonTan/tinyApp/blob/master/docs/registration-page.png?raw=true)
!["Login Page"](https://github.com/DelsonTan/tinyApp/blob/master/docs/login-page.png?raw=true)
!["A List of URLs"](https://github.com/DelsonTan/tinyApp/blob/master/docs/urls-page.png?raw=true)
!["Creating a URL"](https://github.com/DelsonTan/tinyApp/blob/master/docs/create-url.png?raw=true)
!["Updating a URL"](https://github.com/DelsonTan/tinyApp/blob/master/docs/update-url.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Specifications for Use

- A user must register before being able to manage or create URLs. Upon registration they will be logged in immediately
- A user may only view, edit or delete URLs they create
- When creating or updating a URL, be careful to enter a valid URL. Otherwise, the link simply will not work. The workaround is to click edit on the faulty link from the list of URLs, and update with the correct URL

