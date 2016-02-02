require('dotenv').load();
var Bing = require('node-bing-api')({accKey: process.env.BING_KEY});

module.exports = function(MongoClient, mongo_url, app){

  app.get('/:terms', function(req, res){
    var terms = req.params.terms;
    var date = new Date();
    var pageSize = 0;
    if (req.query.offset != null){
      pageSize = Number(req.query.offset.match(/[0-9]+/g));
    }
    if(terms != "favicon.ico"){
      /*save query to database*/
      MongoClient.connect(mongo_url, function(err, db){
        if (err) throw err;
        var searches = db.collection("searches");
        searches.count({search: {$ne: ""}}, function(err, count){
          if (err) throw err;
          searches.insert({id: ++count, term: terms, when: date.toUTCString()});
          db.close();
        });
      });
      
      //get image details and send back to client
      Bing.images(terms, {top: 10, skip: pageSize}, function(err, response, body){
        if (err) throw err;
        var results1 = body.d.results;
        var results2 = results1.map(function(obj){
          return {
            url: obj.MediaUrl, 
            snippet: obj.Title, 
            thumbnail: obj.Thumbnail.MediaUrl, 
            context: obj.SourceUrl 
          };
        });
        res.json(results2);
      });
    }
  });
};