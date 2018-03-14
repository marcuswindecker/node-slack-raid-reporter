const dotenv = require('dotenv')
const Traveler = require('the-traveler').default
const Enums = require('the-traveler/build/enums')
const bodyParser = require('body-parser')
const util = require('util')
const express = require('express')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config()

const traveler = new Traveler({
  apikey: process.env.BUNGIE_API_KEY,
  userAgent: 'slack'
});

app.post('/api/raid', function(req, res) {
	res.setHeader('Content-Type', 'application/json')

	const username = req.body.text

	traveler.searchDestinyPlayer('2', username)
    .then((player) => {
    	if (player.Response.length === 0) {
    		res.send(JSON.stringify('there was an error'))
    	} else {
	    	const membershipId = player.Response[0].membershipId
	    	traveler.getProfile('2', membershipId, { components: 100 })
	    		.then((profile) => {
	    			const characterIds = profile.Response.profile.data.characterIds

	    			res.send(JSON.stringify(characterIds))
	    		})
    	}
    })

 
	

	// res.send(JSON.stringify({
 //  	response_type: 'in_channel',
 //  	text: util.format('Here\'s the raid report for %s on PSN: https://raid.report/ps/%s', reqText, reqText)
 //  }))
})

const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log('Slack Raid Reporter listening on localhost:%s', port)
})