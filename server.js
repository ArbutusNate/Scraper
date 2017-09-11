// Dependencies
  const express = require("express");
  const bodyParser = require("body-parser");
  // var logger = require("morgan");
  const mongoose = require("mongoose");

  const request = require("request");
  const cheerio = require("cheerio");

  const Note = require("./models/Note.js");
  const Article = require("./models/Article.js");
  // Initialize Express
  const app = express();

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//Use body-parser
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect(
  // "mongodb://localhost/articles"
  "mongodb://heroku_92zcd1t9:9vut4es1cpm0cv7rhq4j536fk2@ds133084.mlab.com:33084/heroku_92zcd1t9"
);

const db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

let displayThis = (res, err, doc) => {
  if (!err){
    res.json(doc);
  } else {
    throw err;
  }
}
// Routes
// ======

//Scrape for articles
app.get("/scrape", (req, res) => {
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
  res.redirect("/");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", (req, res) => {
  console.log("Displaying scraped articles");
  Article.find({}, (err, doc) => {
    displayThis(res, err, doc);
  })
});

//Shows saved articles.
app.get("/saved",(req, res) => {
  console.log("Getting saved articles.")
  Article.find({saved : 'true'}, (err, doc) => {
    console.log(doc);
    displayThis(res, err, doc);
  })
});

// Set Saved to True
app.post("/articles/:id", (req, res) => {
  console.log("Saving this article.");
  Article.update({ _id : req.params.id }, { $set: { saved: 'true' }}, (err, doc) => {
    displayThis(res, err, doc);
  })
});

// Get notes for this article
app.get("/articles/notes/:id", (req, res) => {
  console.log("running notes search and populate.")
  Article
    .findOne({ _id : req.params.id })
    .populate("Note")
    .exec(function(err, article) {
      displayThis(res, err, article);
      // if (!err) {
      //   console.log(article);
      // } else {
      //   throw err
      // }
    })
});

// Post Note
app.post("/articles/notes/:id", (req, res) => {
  console.log("postin a note: ");
  let newNote = new Note(req.body);
  console.log(newNote);
  newNote.save((err, doc) => {
    if(!err) {
      Article.findOneAndUpdate({ _id : req.params.id }, { $push: {"Note" : doc._id} }, (err, doc) => {
        if(!err){
          console.log(doc.Note);
        } else {
          throw err
        }
      })
    }
  })
});

// Delete Note
app.delete("/notes/delete/:id", (req, res) => {
  console.log("Deleting note...");
  Note.remove({ _id : req.params.id }, (err, doc) => {
    // displayThis(res, err, doc);
    if(!err) {
      console.log("removed");
      // console.log(doc);
    }
  })
});


// Listen on port 3000
  app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
