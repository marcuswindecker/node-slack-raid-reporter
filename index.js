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

  net.sendInitialResponse(res)

  const requestText = req.body.text
  const delayedResponseUrl = req.body.response_url

  raid.parseRequest(requestText)
    .then((parsedRequest) => raid.getPlayer(parsedRequest))
    .then((player) => raid.getProfile(player))
    // .then((profile) => raid.getActivityStats(profile))
    .then((profile) => raid.getCharacterStats(profile))
    .then((stats) => raid.formatStats(stats))
    .then((formattedStats) => {
      net.sendDelayedResponse(delayedResponseUrl, formattedStats)
    })
    .catch((error) => {
      console.log(error)

      net.sendDelayedResponse(delayedResponseUrl, null, error)
    })
})

//------------- SERVER STARTS HERE ------------------//
const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log('The Speaker is consulting with The Traveler on localhost:%s', port)
})