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
        });
    }


function getExecutives(res, mysql, context, complete){
        mysql.pool.query("SELECT id, CONCAT(fname, ' ', lname) AS exec_name FROM executives", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.executives  = results;
            complete();
        });
    }


function getAllPManagers(res, mysql, context, complete){
    	mysql.pool.query("SELECT portfolio_managers.id, portfolio_managers.fname, portfolio_managers.lname, mutual_funds.name AS fund_managed, years_of_service, college, CONCAT(executives.fname, ' ', executives.lname) AS reports_to FROM portfolio_managers LEFT JOIN mutual_funds ON portfolio_managers.fund_managed = mutual_funds.id LEFT JOIN executives ON portfolio_managers.reports_to = executives.id", function(error, results, fields){
	       	if(error){
			     res.write(JSON.stringify(error));
			     res.end();
		  }
		  context.pmanagers = results;
		  complete();
	   });
    } 

function getPManager(res, mysql, context, id, complete){
	var sql = "SELECT id, fname, lname, fund_managed, years_of_service, college, reports_to FROM portfolio_managers WHERE id = ?";
	var values = [id];
        mysql.pool.query(sql, values, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.pmanager = results[0];
            complete();
        });
    }

function pmanagerFund(res, mysql, context, key, complete) {
    var sql = "SELECT portfolio_managers.id, portfolio_managers.fname, portfolio_managers.lname, mutual_funds.name AS fund_managed, years_of_service, college, CONCAT(executives.fname, ' ', executives.lname) AS reports_to FROM portfolio_managers INNER JOIN mutual_funds ON portfolio_managers.fund_managed = mutual_funds.id LEFT JOIN executives ON portfolio_managers.reports_to = executives.id WHERE mutual_funds.id = ?"
    var key = [key];
    mysql.pool.query(sql, key, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.pmanagerindv = results;
            complete();
        }); 
}

function pmanagerBoss(res, mysql, context, key, complete) {
    var sql = "SELECT portfolio_managers.id, portfolio_managers.fname, portfolio_managers.lname, mutual_funds.name AS fund_managed, years_of_service, college, CONCAT(executives.fname, ' ', executives.lname) AS reports_to FROM portfolio_managers INNER JOIN mutual_funds ON portfolio_managers.fund_managed = mutual_funds.id LEFT JOIN executives ON portfolio_managers.reports_to = executives.id WHERE executives.id = ?"
    var key = [key];
    mysql.pool.query(sql, key, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.pmanagerindv = results;
            complete();
        }); 
}


function getFund(res, mysql, context, key, complete){
        var sql = "SELECT id, name FROM mutual_funds where mutual_funds.id = ?";
        var key = [key];
        mysql.pool.query(sql, key, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.fund  = results[0];
            complete();
        });
    }

function getBoss(res, mysql, context, key, complete){
        var sql = "SELECT id, CONCAT(executives.fname, ' ', executives.lname) AS name FROM executives where executives.id = ?";
        var key = [key];
        mysql.pool.query(sql, key, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.boss  = results[0];
            complete();
        });
    }


router.get('/', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deletePManager.js"];
    var mysql = req.app.get('mysql');
    getAllPManagers(res, mysql, context, complete);
    getFunds(res, mysql, context, complete);
    getExecutives(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 3){
            res.render('pmanagers', context);
        }

    }
});

router.get('/indv', function(req, res){
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deletePManager.js"];
    var mysql = req.app.get('mysql');
    var key = req.query.fund_managed;
    pmanagerFund(res, mysql, context, key, complete);
    getFund(res, mysql, context, key, complete);
    getFunds(res, mysql, context, complete);
    getExecutives(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 4){
            res.render('pmanagerindv', context);
        }

    }
});

router.post('/indv', function(req, res){
    var mysql = req.app.get('mysql');
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["deletePManager.js"];
    var mysql = req.app.get('mysql');
    var key = req.body.reports_to;
    pmanagerBoss(res, mysql, context, key, complete);
    getBoss(res, mysql, context, key, complete);
    getFunds(res, mysql, context, complete);
    getExecutives(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 4){
            res.render('pmanagerindv', context);
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
    if (req.body.fund_managed == "null");
	req.body.fund_managed = null;
    if (req.body.years_of_service == "")
	req.body.years_of_service = null;
    if (req.body.college == "")
	req.body.college = null;
    if (req.body.reports_to == "null")
	req.body.reports_to = null;
	
    var sql = "INSERT INTO portfolio_managers (fname, lname, fund_managed, years_of_service, college, reports_to) VALUES (?,?,?,?,?,?)";
    var inserts = [req.body.fname, req.body.lname, req.body.fund_managed, req.body.years_of_service, req.body.college, req.body.reports_to];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
	    var msg = JSON.stringify(error);
	    var read_msg = JSON.parse(msg);
	    var err_msg = read_msg.sqlMessage;
	    res.set('content-Type', 'text/html');
    	    res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
	    res.write(err_msg);
	    res.write("</br><p>To return to the previous page click <a href='portfolio_managers'>here</a></p>");
            res.end();
            }else{
                res.redirect('/portfolio_managers');
            }
        });
    });

router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["fundSelector.js", "execSelector.js", "updatepmanager.js"];
        var mysql = req.app.get('mysql');
        getPManager(res, mysql, context, req.params.id, complete);
        getFunds(res, mysql, context, complete);
        getExecutives(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-pmanager', context);
            }

        }
    });


router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
	// change invalid strings to null
	if (req.body.fund_managed == "null")
		req.body.fund_managed = null;
	if (req.body.reports_to == "null")
		req.body.reports_to = null;
	if (req.body.fname == "")
		req.body.fname = null;
	if (req.body.lname == "")
		req.body.lname = null;

        var sql = "UPDATE portfolio_managers SET fname=?, lname=?, fund_managed=?, years_of_service=?, college=?, reports_to=? WHERE id=?";
        var inserts = [req.body.fname, req.body.lname, req.body.fund_managed, req.body.years_of_service, req.body.college, req.body.reports_to, req.params.id];


        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
		var msg = JSON.stringify(error);
                res.write(msg.sqlMessage);
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });




router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM portfolio_managers WHERE id = ?";
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
