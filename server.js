require('dotenv').load();

var express = require('express');
var app = express();
var port = process.env.PORT;
var MongoClient = require('mongodb').MongoClient;
var mongo_url = process.env.MONGO_URI;

/*var searches = require('./search.js');*/
//var home = require('./index.js');
/*
searches(MongoClient, mongo_url, app);*/
//home(MongoClient, mongo_url, app);
  app.get('/', function(req, res){
      MongoClient.connect(mongo_url, function(err, db){
        if (err) throw err;
        var searches = db.collection("searches");
        searches.count({id: {$ne: 0}}, function(err, count){
          if (err) throw err;
          searches.find({
            id: {$gt: count - 10}
          }).sort({id: -1})
          .toArray(function(err, documents){
            if (err) throw err;
            var response = documents.map(function(obj){
              return {term: obj.term, when: obj.when};
            });
            res.send(response);
          db.close();
        });
      });
    });
  });
//to start server
app.listen(port || 8080, process.env.IP || "0.0.0.0", function(){
    console.log("server listening at", port);
});