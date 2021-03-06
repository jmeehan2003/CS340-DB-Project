var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 5000);
app.set('mysql', mysql);

app.use('/', require('./home.js'));

app.use('/portfolio_managers', require('./pmanagers.js'));

app.use('/executives', require('./executives.js'));

app.use('/funds', require('./funds.js'));

app.use('/styles', require('./styles.js'));

app.use('/stocks', require('./stocks.js'));

app.use('/search', require('./search.js'));

app.use('/holdings', require('./holdings.js'));

app.use('/owns', require('./owns.js'));

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
