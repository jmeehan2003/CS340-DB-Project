module.exports = function(){
    var express = require('express');
    var router = express.Router();

function getOwnership(res, mysql, context, key, complete){
        var sql = "SELECT mutual_funds.id AS fid, mutual_funds.name AS fname, style FROM mutual_funds INNER JOIN fund_stocks ON mutual_funds.id = fund_stocks.fid INNER JOIN stocks ON fund_stocks.sid = stocks.id WHERE stocks.id=?";
        var insert = [key];
	    mysql.pool.query(sql, insert, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.owns  = results;
            complete();
        });
    }

function getStock(res, mysql, context, key, complete){
    var sql = "SELECT name FROM stocks WHERE stocks.id=?";
        var insert = [key];
        mysql.pool.query(sql, insert, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.stock  = results[0];
            complete();
        });
    }

function getAllStocks(res, mysql, context, complete){
    var sql = "SELECT id, name FROM stocks";
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.stocksall  = results;
            complete();
        });
    }



router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    var key = req.query.owns;
    getOwnership(res, mysql, context, key, complete);
    getStock(res, mysql, context, key, complete);
    getAllStocks(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 3){
            res.render('owns', context);
        }

    }
});

    return router;
}();
