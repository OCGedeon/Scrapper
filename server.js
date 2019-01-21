let express = require('express');
let bodyParser = require('body-parser'); 
let exphbs = require('express-handlebars'); 

var db = require("./models"); 
let cheerio = require('cheerio'); 
let mongoose = require('mongoose');

let PORT = process.env.PORT || 8080; // Set Default Port for Express and Heroku
let app = express(); // Initialize Express

// app.use(logger("dev")); // Use morgan logger for logging requests
app.use(bodyParser.urlencoded({ extended: false })); // Use body-parser for handling form submissions
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static content for the app from the "public" directory in the application directory.

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

require("./controllers/webScrapperController.js")(app);

app.listen(PORT, ()=>{
    console.log(`App listening on PORT ${PORT}`);
