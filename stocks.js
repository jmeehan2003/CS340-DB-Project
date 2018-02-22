module.exports = function(){
    var express = require('express');
    var router = express.Router();


function getStocks(res, mysql, context, complete){
        mysql.pool.query("SELECT id, ticker, name, business, price, EPS FROM stocks", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.stocks  = results;
            complete();
        });
    }


router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    context.jsscripts=["deleteStock.js"];
    getStocks(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 1){
            res.render('stocks', context);
        }

    }
});

router.get('/search', function(req, res){

    var context = {};
    context.jsscripts=["deleteStock.js"];
    var mysql = req.app.get('mysql');
    var inserts = [req.query.userval];
    if (req.query.sel == "price") {
	    mysql.pool.query("SELECT id, ticker, name, business, price, EPS FROM stocks WHERE price > ?", inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.stockssearch  = results;
             res.render('stocksindv', context);
    })
}
    else {
        mysql.pool.query("SELECT id, ticker, name, business, price, EPS FROM stocks WHERE EPS > ?", inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.stockssearch  = results;
             res.render('stocksindv', context);
   }) }
});

router.post('/', function(req, res){
    var mysql = req.app.get('mysql');

    // change invalid/empty strings to null
    if (req.body.ticker == "")
	req.body.ticker = null;
    if (req.body.name == "")
    req.body.name = null;
    if (req.body.business == "")
	req.body.business = null;
    if (req.body.price == "")
	req.body.price = null;
     if (req.body.EPS == "")
    req.body.EPS = null;
    
	
    var sql = "INSERT INTO stocks (ticker, name, business, price, EPS) VALUES (?,?,?,?,?)";
    var inserts = [req.body.ticker, req.body.name, req.body.business, req.body.price, req.body.EPS];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
	    var msg = JSON.stringify(error);
	    var read_msg = JSON.parse(msg);
	    var err_msg = read_msg.sqlMessage;
	    res.set('content-Type', 'text/html');
    	    res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
	    res.write(err_msg);
	    res.write("</br><p>To return to the previous page click <a href='stocks'>here</a></p>");
            res.end();
            }else{
                res.redirect('/stocks');
            }
        });
    });

router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM stocks WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })


return router;
}();
