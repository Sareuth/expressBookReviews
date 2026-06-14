const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the user exists
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
};

const isValid = (username) => { //returns boolean
    let validusers = users.filter((user) => {
        return user.username === username && user.password === password;
    });
    return validusers.length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
    let validusers = users.filter((user) => {
        return user.username === username && user.password === password;
    });
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const user = req.session.authorization.username;
    const review = req.query.review;
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) return res.status(404).json({message: "Book not found"});
    if (!review) return res.status(400).json({message: "Review is required"});

    book.reviews[user] = review;
    return res.status(200).json({
        message: "Review successfully added or updated",
        reviews: book.reviews    
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const user = req.session.authorization.username;
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) return res.status(404).json({ message: "Book not found" });

    if (!book.reviews[user]) return res.status(404).json({ message: "Review not found" });

    delete book.reviews[user];
    return res.status(200).json({"message":"Review successfully deleted"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.doesExist = doesExist;
