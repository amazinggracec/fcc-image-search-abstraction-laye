var Bing = require('node-bing-api')({accKey: process.env.BING_KEY});

require('dotenv').load();

module.exports = function(MongoClient, mongo_url, app){
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
  
  app.use('/:terms', function(req, res){
    var terms = req.params.terms;
    var date = new Date();
    var pageSize = 0;
    if (req.query.offset != null){
      pageSize = Number(req.query.offset.match(/[0-9]+/g));
    }
      
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
  });
};