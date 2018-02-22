module.exports = function(){
    var express = require('express');
    var router = express.Router();


function getAllExecutives(res, mysql, context, complete){
        mysql.pool.query("SELECT id, fname, lname, years_service, age, title FROM executives", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.executives  = results;
            complete();
        });
    }



function getExecutive(res, mysql, context, id, complete){
	var sql = "SELECT id, fname, lname, years_service, age, title FROM executives WHERE id = ?";
	var values = [id];
        mysql.pool.query(sql, values, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.executive = results[0];
            complete();
        });
    }

router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deleteExecutive.js"];
    var mysql = req.app.get('mysql');
    getAllExecutives(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 1){
            res.render('executives', context);
        }

    }
});

router.post('/', function(req, res){
    var mysql = req.app.get('mysql');

    // change invalid strings to null
    if (req.body.fname == "")
	req.body.fname = null;
    if (req.body.lname == "")
	req.body.lname = null;
    if (req.body.years_service == "")
	req.body.years_of_service = null;
    if (req.body.age == "")
	req.body.age = null;
    if (req.body.title == "")
	req.body.reports_to = null;
	
    var sql = "INSERT INTO executives (fname, lname, years_service, age, title) VALUES (?,?,?,?,?)";
    var inserts = [req.body.fname, req.body.lname, req.body.years_service, req.body.age, req.body.title];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
	       var msg = JSON.stringify(error);
	       var read_msg = JSON.parse(msg);
	       var err_msg = read_msg.sqlMessage;
	       res.set('content-Type', 'text/html');
    	   res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
	       res.write(err_msg);
	       res.write("</br><p>To return to the previous page click <a href='executives'>here</a></p>");
            res.end();
        }else{
            res.redirect('/executives');
        }
        });
    });

router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateExecutive.js"];
        var mysql = req.app.get('mysql');
        getExecutive(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-executive', context);
            }

        }
    });


router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
	// change invalid strings to null
	if (req.body.years_service == "")
		req.body.years_service= null;
    if (req.body.age == "")
        req.body.age = null;
	if (req.body.title == "")
		req.body.title = null;
	if (req.body.fname == "")
		req.body.fname = null;
	if (req.body.lname == "")
		req.body.lname = null;

        var sql = "UPDATE executives SET fname=?, lname=?, years_service=?, age=?, title=? WHERE id=?";
        var inserts = [req.body.fname, req.body.lname, req.body.years_service, req.body.age, req.body.title, req.params.id];


        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
		  var msg = JSON.stringify(error);
           var read_msg = JSON.parse(msg);
           var err_msg = read_msg.sqlMessage;
           res.set('content-Type', 'text/html');
           res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
           res.write(err_msg);
           res.write("</br><p>To return to the previous page click <a href='executives'>here</a></p>");
            res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });




router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM executives WHERE id = ?";
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
