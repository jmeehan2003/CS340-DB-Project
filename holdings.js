module.exports = function(){
    var express = require('express');
    var router = express.Router();

function getHoldings(res, mysql, context, key, complete){
        var sql = "SELECT mutual_funds.id AS fid, mutual_funds.name AS fname, stocks.id AS sid, ticker,stocks.name, business, price, EPS FROM stocks INNER JOIN fund_stocks ON stocks.id = fund_stocks.sid INNER JOIN mutual_funds ON fund_stocks.fid = mutual_funds.id WHERE mutual_funds.id=?";
        var insert = [key];
	    mysql.pool.query(sql, insert, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.holdings  = results;
            complete();
        });
    }

function getAllOtherStocks(res, mysql, context, key, complete){
        var sql = "SELECT tbl1.sid AS sid, tbl1.name AS name FROM (SELECT stocks.id AS sid, name FROM stocks) AS tbl1 WHERE tbl1.sid NOT IN (SELECT stocks.id AS sid FROM stocks INNER JOIN fund_stocks ON stocks.id = fund_stocks.sid INNER JOIN mutual_funds ON fund_stocks.fid = mutual_funds.id WHERE mutual_funds.id = ?)";
        var insert = [key]; 
	mysql.pool.query(sql, insert, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.stocks  = results;
            complete();
        });
    }

function getFund(res, mysql, context, key, complete){
    var sql = "SELECT id, name FROM mutual_funds WHERE mutual_funds.id=?";
        var insert = [key];
   	 mysql.pool.query(sql, insert, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.fund  = results[0];
            complete();
        });
    }

function getAllFunds(res, mysql, context, complete){
    var sql = "SELECT id, name FROM mutual_funds";
     mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.fundsall  = results;
            complete();
        });
    }



router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteHolding.js"];
    var mysql = req.app.get('mysql');
    var key = req.query.fund;
    getHoldings(res, mysql, context, key, complete);
    getFund(res, mysql, context, key, complete);
    getAllOtherStocks(res, mysql, context, key, complete);
    getAllFunds(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 4){
            res.render('holdings', context);
        }

    }
});


router.post('/', function(req, res){
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO fund_stocks (fid, sid) VALUES (?, ?)";
    var inserts = [req.body.fundid, req.body.sid];
    mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
        var msg = JSON.stringify(error);
        var read_msg = JSON.parse(msg);
        var err_msg = read_msg.sqlMessage;
        res.set('content-Type', 'text/html');
            res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
        res.write(err_msg);
        res.write("</br><p>To return to the previous page click <a href='holdings'>here</a></p>");
            res.end();
            }else{
                res.redirect('/holdings?fund=' + req.body.fundid);
            }
        });
});


router.delete('/:id1&:id2', function(req, res){
        var mysql = req.app.get('mysql');
	console.log("inside delete");
	console.log("param1 " + req.params.id1 + "and param 2 is " + req.params.id2); 
        var sql = "DELETE FROM fund_stocks WHERE fund_stocks.fid = ? AND fund_stocks.sid = ?";
        var inserts = [req.params.id1, req.params.id2];
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
