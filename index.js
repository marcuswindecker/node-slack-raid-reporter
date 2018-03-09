//var scraper = require('./src/scraper')

var phantom = require('phantom');

var bodyParser = require('body-parser')
var util = require('util')

var express = require('express')
var app = express()

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/stats', function(req, res) {
	var reqText = req.body.text
	
	res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({
  	response_type: 'in_channel',
  	text: util.format('Here\'s the raid report for %s on PSN: https://raid.report/ps/%s', reqText, reqText)
  }))
 
 // 	var _ph, _page, _outObj;

	// phantom.create()
	//   .then(ph => {
	//     _ph = ph;
	//     return _ph.createPage();
	//   })
	//   .then(page => {
	//     _page = page;

	//     _page.property('onInitialized', function() {
	//     	console.log('page initialized')

	// 	    if(_page.injectJs('/vendor/core-js.js')) {
	// 	      console.log("Polyfills loaded")
	// 	    } else {
	// 	    	console.log("something went wrong.")
	// 	    }
	// 		})

	//     return _page.open('https://raid.report/ps/skaterape');
	//   })
	//   .then(status => {
	//     console.log(status);
	//     return _page.property('content');
	//   })
	//   .then(content => {

 //  		_page.render('./page.jpg')
 //  		_page.close();
	//     _ph.exit();

	//     res.send(content)
	//   })
	//   .catch(e => console.log(e));
})

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port
  console.log('Slack Raid Reporter listening on localhost:%s', port)
})