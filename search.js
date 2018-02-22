module.exports = function(){
	var express = require('express');
	var router = express.Router();

function searchFull(res, mysql, context, key, complete){
var sql =  "SELECT CONCAT(executives.fname, ' ', executives.lname) AS Name, 'Executives' AS category FROM executives WHERE executives.fname LIKE ? OR executives.lname LIKE ? UNION SELECT CONCAT(portfolio_managers.fname, ' ', portfolio_managers.lname) AS Name, 'Portfolio_Managers' AS category FROM portfolio_managers WHERE portfolio_managers.fname LIKE ? OR portfolio_managers.lname LIKE ? UNION SELECT mutual_funds.name AS Name, 'Funds' AS category FROM mutual_funds WHERE mutual_funds.name LIKE ? UNION SELECT fund_style.category AS Name, 'Styles' AS category FROM fund_style WHERE fund_style.category LIKE ? UNION SELECT stocks.name AS Name, 'Stocks' AS category FROM stocks WHERE stocks.name LIKE ?";

var q = ['%'+key+'%'];

var inserts = [q, q, q, q, q, q, q];
mysql.pool.query(sql, inserts, function(error, results, fields){
	  if(error){
		var msg = JSON.stringify(error);
        res.write(msg.sqlMessage);
        res.end();
       }else{
        	context.search = results;
        	complete();
		}
	});
}


router.get('/', function(req, res) {
	var callbackCount = 0;
	var context = {};
	var key = req.query.name;
	var mysql = req.app.get('mysql');
	searchFull(res, mysql, context, key, complete);
	function complete(){
        callbackCount++;
        if(callbackCount >= 1){
            	res.render('search', context);
        }
	}
});


return router;

}();
