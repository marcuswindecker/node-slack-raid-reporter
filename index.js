// require external libs
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const express = require('express')

// require custom libs
const net = require('./dist/net.js').default
const raid = require('./dist/raid.js').default

// init Express
const app = express()

// init request parsing lib and dotenv
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config()

//------------- ENDPOINTS START HERE ------------------//
app.post('/api/raid', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const username = req.body.text
  const delayedResponseUrl = req.body.response_url

  net.initialResponse(res, username)

  raid.getPlayer(username)
    .then((player) => raid.getProfile(player))
    .then((profile) => raid.getCharacterStats(profile))
    .then((stats) => {
      let completions = 0

      for (const character of stats) {
        completions += character.Response.raid.allTime.activitiesCleared.basic.value
      }

      net.delayedResponse(delayedResponseUrl, completions)
    })
    .catch((error) => {
      net.delayedResponse(delayedResponseUrl, 0, error)
    })
})

//------------- SERVER STARTS HERE ------------------//
const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log('Slack Raid Reporter listening on localhost:%s', port)
})