var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_meehajam',
  password        : '4470',
  database        : 'cs340_meehajam',
  dateStrings	  : true
});

module.exports.pool = pool;
