require('dotenv').load();

var express = require('express');
var app = express();
var port = process.env.PORT;
var MongoClient = require('mongodb').MongoClient;
var mongo_url = process.env.MONGO_URI;

var searches = require('./search.js');
var home = require('./index.js');

searches(MongoClient, mongo_url, app);
home(MongoClient, mongo_url, app);

//to start server
app.listen(port || 8080, process.env.IP || "0.0.0.0", function(){
    console.log("server listening at", port);
});