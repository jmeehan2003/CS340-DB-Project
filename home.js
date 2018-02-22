module.exports = function(){
   var express = require('express');
   var router = express.Router();


function getFunds(res, mysql, context, complete){
	mysql.pool.query("SELECT id, name FROM mutual_funds", function(error, results, fields){
		if(error){
			    res.write(JSON.stringify(error));
                res.end();
            }
            context.funds  = results;
            complete();
	})
}

function getData(res, mysql, context, complete){
  var q = "SELECT SUM(amount_invested) AS sum, COUNT(*) AS count FROM mutual_funds";
  mysql.pool.query(q, function(err, res){
  if (err) {
       	res.write(JSON.stringify(err));
	res.end();
  }
  res[0].sum = res[0].sum.toLocaleString();
  context.data = res[0];
  complete();
  });
}

function getStocks(res, mysql, context, complete){
  mysql.pool.query("SELECT id, name FROM stocks", function(error, results, fields){
    if(error){
          res.write(JSON.stringify(error));
                res.end();
            }
            context.stocks  = results;
            complete();
  })
}





router.get('/', function(req, res){
   var callbackCount = 0;
   var context = {};
   context.jsscripts = ["script.js"];
   var mysql = req.app.get('mysql');
   getData(res, mysql, context, complete);
   getFunds(res, mysql, context, complete);
   getStocks(res, mysql, context, complete);
   function complete(){
	callbackCount++;
	if(callbackCount >= 3){
		res.render('home', context);
	}
  }
});

return router;
} ();
