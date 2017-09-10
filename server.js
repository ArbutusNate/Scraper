// Dependencies
const express = require("express");
const bodyParser = require("body-parser");
// var logger = require("morgan");
const mongoose = require("mongoose");

const request = require("request");
const cheerio = require("cheerio");

const Models = require("./models/Comment.js");
const Article = require("./models/Article.js");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
const app = express();

// Use morgan and body parser with our app
// app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/articles");
const db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

app.get("/scrape", function(req, res) {
  console.log("trying to scrape");
  // First, we grab the body of the html with request
  request("https://www.nytimes.com/science", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2.headline").each(function(i, element) {
      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      var entry = new Article(result);
      // SAVE
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });
  // res.send("Scraped");
  res.redirect("/");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  console.log("trying to get scraped info");
  Article.find({}, (err, doc) => {
    if(!err) {
      res.json(doc);
    } else {
      throw err;
    }
  })
});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  console.log("trying to make it go");
  Article.find({_id : req.paramds.id}, (err, doc) => {
    if(!err){
      console.log(doc.Notes);
    }
  })

  // TODO
  // ====

  // Finish the route so it finds one article using the req.params.id,

  // and run the populate method with "note",

  // then responds with the article with the note included


});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {


  // TODO
  // ====

  // save the new note that gets posted to the Notes collection

  // then find an article from the req.params.id

  // and update it's "note" property with the _id of the new note


});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
