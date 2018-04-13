// require external libs
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')

// require custom libs
const net = require('./dist/net.js').default
const raid = require('./dist/raid.js').default

// init Express
const app = express()

// init request parsing lib
app.use(bodyParser.urlencoded({ extended: true }))

//------------- ENDPOINTS START HERE ------------------//
app.post('/api/raid', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  // send an initial response in order to satisfy the 3sec Slack timeout
  net.sendInitialResponse(res)

  const requestText = req.body.text
  const delayedResponseUrl = req.body.response_url

  // parse the request
  raid.parseRequest(requestText)
    // get the player definition
    .then((parsedRequest) => raid.getPlayer(parsedRequest))
    // get the player's profile
    .then((player) => raid.getProfile(player))
    // get stats for the player's characters
    .then((profile) => raid.getCharacterStats(profile))
    // format the stats into an easier object to work with
    .then((stats) => raid.formatStats(stats))
    .then((formattedStats) => {
      // send the delayed response with the formatted stats
      net.sendDelayedResponse(delayedResponseUrl, formattedStats)
    })
    // an error was caught somewhere in the promise chain
    .catch((error) => {
      console.log(error)

      // send a delayed response with the error 
      net.sendDelayedResponse(delayedResponseUrl, null, error)
    })
})

//------------- SERVER STARTS HERE ------------------//
const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log('The Speaker is consulting with The Traveler on localhost:%s', port)
})