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
app.use(bodyParser.urlencoded({ extended: true }));

//------------- ENDPOINTS START HERE ------------------//
app.post('/api/raid', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const username = req.body.text
  const delayedResponseUrl = req.body.response_url

  net.initialResponse(res, username)

  raid.getPlayer(username)
    .then((player) => raid.getProfile(player))
    .then((profile) => raid.getCharacterStats(profile))
    // .then((profile) => raid.getActivityStats(profile))
    .then((stats) => raid.buildStatsResponse(stats))
    .then((statsResponse) => {
      console.log(Math.min(...statsResponse.fastest_times))

      net.delayedResponse(delayedResponseUrl, statsResponse)
    })
    .catch((error) => {
      net.delayedResponse(delayedResponseUrl, 0, error)
    })
})

//------------- SERVER STARTS HERE ------------------//
const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log('The Speaker listening on localhost:%s', port)
})