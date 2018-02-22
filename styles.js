module.exports = function(){
    var express = require('express');
    var router = express.Router();


function getStyles(res, mysql, context, complete){
        mysql.pool.query("SELECT id, category, region, risk_tolerance FROM fund_style", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.styles  = results;
            complete();
        });
    }


router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteStyle.js"];
    var mysql = req.app.get('mysql');
    getStyles(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 1){
            res.render('styles', context);
        }

    }
});

router.post('/', function(req, res){
    var mysql = req.app.get('mysql');

    // change invalid/empty strings to null
    if (req.body.category == "")
	req.body.category = null;
    if (req.body.region == "")
	req.body.region = null;
    if (req.body.risk_tolerance == "")
	req.body.risk_tolerance = null;
    
	
    var sql = "INSERT INTO fund_style (category, region, risk_tolerance) VALUES (?,?,?)";
    var inserts = [req.body.category, req.body.region, req.body.risk_tolerance];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
	    var msg = JSON.stringify(error);
	    var read_msg = JSON.parse(msg);
	    var err_msg = read_msg.sqlMessage;
	    res.set('content-Type', 'text/html');
    	    res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
	    res.write(err_msg);
	    res.write("</br><p>To return to the previous page click <a href='styles'>here</a></p>");
            res.end();
            }else{
                res.redirect('/styles');
            }
        });
    });

router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM fund_style WHERE id = ?";
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
