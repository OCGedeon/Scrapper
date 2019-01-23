let axios = require('axios');
let cheerio = require('cheerio');
let mongoose = require('mongoose');
let db = require("../models");


mongoose.Promise = Promise;
mongoose.connect("", {
    useMongoClient: true
});

let mongooseConnection = mongoose.connection;

mongooseConnection.on('error', console.error.bind(console, 'connection error:'));
mongooseConnection.once('open', function () {
    console.log(`Sucessfully Connected to Mongo DB`);
});


module.exports = (app) => {

    app.get("/", (req, res) => res.render("index"));

    // Scrape Articles Route
    app.get("/api/search", (req, res) => {

        axios.get("https://www.hotnewhiphop.com/articles/news/").then(response => {
            // console.log("Response");

            let $ = cheerio.load(response.data);

            let handlebarsObject = {
                data: []
            };

            $("article").each((i, element) => {

                let lowResImageLink = $(element).children('.item-image').children('.imagewrap').children('a').children('img').attr
                    ('src');

                if (lowResImageLink) {

                    let imageLength = lowResImageLink.length;
                    let highResImage = lowResImageLink.substr(0, imageLength - 11) + "800-c100.jpg";

                    handlebarsObject.data.push({
                        headline: $(element).children('.item-info').children('.title').children('a').text(),
                        summary: $(element).children('.item-info').children('.teaser').children('a').text(),
                        url: $(element).children('.item-info').children('.title').children('a').attr('href'),
                        imageURL: highResImage,
                        slug: $(element).children('.item-info').children('.slug-wrap').children('.slug').children('a').text(),
                        comments: null
                    });
                }
            });


            res.render("index", handlebarsObject);
        });
    });


    app.get("/api/savedArticles", (req, res) => {
        // Grab every document in the Articles collection
        db.Articles.find({}). // Find all Saved Articles
            then(function (dbArticle) {
                // If successfully found Articles, send them back to the client
                res.json(dbArticle);
            }).catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    }); // Default Route


    app.post("/api/add", (req, res) => { // Add Article Route

        // console.log("add path hit");

        let articleObject = req.body;

        db.Articles. // Save the Article to the Database
            findOne({ url: articleObject.url }). // Look for an Existing Article with the Same URL
            then(function (response) {

                if (response === null) { // Only Create Article if it has not been Created
                    db.Articles.create(articleObject).then((response) => console.log(" ")).catch(err => res.json(err));
                } // End if

                // If we were able to successfully  save an Article, send a message to the client
                res.send("Article Saved");
            }).catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });

    });


    app.post("/api/deleteArticle", (req, res) => {
        // console.log(req.body)
        sessionArticle = req.body;

        db.Articles.findByIdAndRemove(sessionArticle["_id"]).
            then(response => {
                if (response) {
                    res.send("Sucessfully Deleted");
                }
            });
    });

    // Delete Comment Route
    app.post("/api/deleteComment", (req, res) => {
        // console.log("delete comment route hit")
        let comment = req.body;
        db.Notes.findByIdAndRemove(comment["_id"]). // Look for the Comment/ID and Remove from DB
            then(response => {
                if (response) {
                    res.send("Sucessfully Deleted");
                }
            });
    });

    // Create Notes Route
    app.post("/api/createNotes", (req, res) => {

        sessionArticle = req.body;

        db.Notes.create(sessionArticle.body).then(function (dbNote) {
            // console.log(dbNote);

            return db.Articles.findOneAndUpdate({
                _id: sessionArticle.articleID.articleID
            }, {
                    $push: {
                        note: dbNote._id
                    }
                });
        }).then(function (dbArticle) {

            res.json(dbArticle);
        }).catch(function (err) {

            res.json(err);
        });
    });


    app.post("/api/populateNote", function (req, res) {

        // console.log("ID is "+ req.body.articleID);

        db.Articles.findOne({ _id: req.body.articleID }).populate("Note").
            then((response) => {
                // console.log("response is " + response);

                if (response.note.length == 1) {

                    db.Notes.findOne({ '_id': response.note }).then((comment) => {
                        comment = [comment];
                        console.log("Sending Back One Comment");
                        res.json(comment);
                    });

                } else {

                    console.log("2")
                    db.Notes.find({
                        '_id': {
                            "$in": response.note
                        }
                    }).then((comments) => {

                        res.json(comments);
                    });
                }

            }).catch(function (err) {

                res.json(err);

            });

    });

} 