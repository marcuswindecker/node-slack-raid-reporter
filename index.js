var Traveler = require('the-traveler').default
var Enums = require('the-traveler/build/enums')
var bodyParser = require('body-parser')
var util = require('util')
var express = require('express')
var app = express()

app.use(bodyParser.urlencoded({ extended: true }));

var traveler = new Traveler({
  apikey: '', // TODO: replace with .env var
  userAgent: 'slack'
});

app.post('/api/raid', function(req, res) {
	res.setHeader('Content-Type', 'application/json')

	var username = req.body.text

	traveler.searchDestinyPlayer('2', username)
    .then((player) => {
    	if (player.Response.length === 0) {
    		res.send(JSON.stringify('there was an error'))
    	} else {
	    	var membershipId = player.Response[0].membershipId
	    	traveler.getProfile('2', membershipId, { components: 100 })
	    		.then((profile) => {
	    			var characterIds = profile.Response.profile.data.characterIds

	    			res.send(JSON.stringify(characterIds))
	    		})
    	}
    })

 
	

	// res.send(JSON.stringify({
 //  	response_type: 'in_channel',
 //  	text: util.format('Here\'s the raid report for %s on PSN: https://raid.report/ps/%s', reqText, reqText)
 //  }))
})

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port
  console.log('Slack Raid Reporter listening on localhost:%s', port)
})