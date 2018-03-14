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
})

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port
  console.log('Slack Raid Reporter listening on localhost:%s', port)
})