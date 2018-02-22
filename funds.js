module.exports = function(){
    var express = require('express');
    var router = express.Router();


function getStyles(res, mysql, context, complete){
        mysql.pool.query("SELECT id, category FROM fund_style", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.styles  = results;
            complete();
        });
    }


function getFunds(res, mysql, context, complete){
        mysql.pool.query("SELECT id, name, style, DATE_FORMAT(inception_date, '%m/%d/%Y') AS date, CONCAT('$', FORMAT(amount_invested, 0)) AS amount_invested FROM mutual_funds", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.funds  = results;
            complete();
        });
   } 


router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteFund.js"];
    var mysql = req.app.get('mysql');
    getStyles(res, mysql, context, complete);
    getFunds(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 2){
            res.render('funds', context);
        }

    }
});

router.post('/', function(req, res){
    var mysql = req.app.get('mysql');
	var date = req.body.inception_date;

    // change invalid/empty strings to null
    if (req.body.name == "")
	req.body.name = null;
    if (req.body.style == "null")
	req.body.style = null;
    if (req.body.inception_date == "")
	req.body.inception_date = null;
    if (req.body.amount_invested == "")
	req.body.amount_invested = null;
      console.log(req.body.inception_date);
	
    var sql = "INSERT INTO mutual_funds (name, style, inception_date, amount_invested) VALUES (?,?,?,?)";
    var inserts = [req.body.name, req.body.style, req.body.inception_date, req.body.amount_invested];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
	    var msg = JSON.stringify(error);
	    var read_msg = JSON.parse(msg);
	    var err_msg = read_msg.sqlMessage;
	    res.set('content-Type', 'text/html');
    	    res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
	    res.write(err_msg);
	    res.write("</br><p>To return to the previous page click <a href='funds'>here</a></p>");
            res.end();
            }else{
                res.redirect('/funds');
            }
        });
    });


router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM mutual_funds WHERE id = ?";
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
