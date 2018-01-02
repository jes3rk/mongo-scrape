var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var db = require("./models");
var request = require("request");

var PORT = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://heroku_14pdvb47:cfcj25q8gjjipk5pgjgirglfr3@ds235807.mlab.com:35807/heroku_14pdvb47", {
  useMongoClient: true
});

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// routing
app.get("/", function(req, res) {
  console.log("route ping")
  request.get("https://www.washingtonpost.com/regional/", function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var articles_db = [];
      console.log("recieved data");
      // console.log(body);

      // grab db
      db.Article
        .find({})
        .then(function(dbArticle) {
          // console.log(dbArticle);
          var articles_db = dbArticle;
          var $ = cheerio.load(body);
          $("section .flex-stack.normal-air.col-xs-8.flex-stack-text").each(function(i, element) {
            var result = {};

            result.headline = $(this)
              .children("div .headline")
                .children("a")
                .text();

            result.link = $(this)
              .find("a")
              .attr("href");

            result.summary = $(this)
              .children("div .blurb")
              .text();

            result.author = $(this)
              .find("span.author.vcard")
              .text();

            // console.log(result);
            if (articles_db.length > 0) {
              var link = 0;
              for (var i = 0; i < articles_db.length; i++) {
                if (result.link === articles_db[i].link) {
                  // console.log("if triggered")
                  link++;
                };
              };
              if (link === 0) {
                addDB(result)
              }
            } else {
              addDB(result);
            };
          });
        });
    };
  });
  // functions
  function refresh() {
    // console.log("Refresh tbd");
    db.Article
      .find({})
      .then(function(dbArticle) {
        // res.json(dbArticle);
        var hbsObj = {
          data: dbArticle
        };
        // console.log(hbsObj);
        res.render("index", hbsObj);
      })
      .catch(function(err) {
        res.json(err);
      });
  };


  function addDB(entry) {
    db.Article
      .create(entry)
      .then(function() {
        // refresh();
        // console.log("New entry added");
      })
      .catch(function(err) {
        res.json(err);
      });
  };
  // res.json("test");
  refresh();
});

app.post("/add/:id", function(req, res) {
  console.log(req.body);
  var newCom = req.body;
  newCom.article = req.params.id;
  db.Comments
    .create(newCom)
    .then(function(dbComments) {
      // return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbId._id}, { new: true });
    })
    .catch(function(err) {
      res.json(err);
    });
  res.redirect("/")
});

app.get("/api/comments/:id", function(req, res) {
  db.Comments
    .find({ article: req.params.id })
    .then(function(dbComments) {
      res.json(dbComments);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/api/del/:id", function(req, res) {
  db.Comments
    .find({ _id: req.params.id })
    .remove()
    .then(function(dbComments) {
      res.redirect("/");
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

// mongodb://heroku_14pdvb47:cfcj25q8gjjipk5pgjgirglfr3@ds235807.mlab.com:35807/heroku_14pdvb47
