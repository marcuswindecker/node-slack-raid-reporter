const dotenv = require('dotenv')
const Traveler = require('the-traveler').default
const Enums = require('the-traveler/build/enums')
const bodyParser = require('body-parser')
const util = require('util')
const request = require('request')
const express = require('express')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config()

const traveler = new Traveler({
  apikey: process.env.BUNGIE_API_KEY,
  userAgent: 'slack'
});

function respondToInitialSlackRequest(response, text) {
  response.send(JSON.stringify({
    response_type: 'in_channel',
    text: text
  }))
}

app.post('/api/raid', function(req, res) {
  res.setHeader('Content-Type', 'application/json')

  const username = req.body.text
  const delayedResponseUrl = req.body.response_url

  traveler.searchDestinyPlayer('2', username)
    .then((player) => {
      if (player.Response.length === 0) {
        respondToInitialSlackRequest(res, util.format('Couldn\'t find the user %s on PSN', username))
      } else {
        respondToInitialSlackRequest(res, util.format('Retrieving data for user %s on PSN...Here\'s their raid.report in the meantime: https://raid.report/ps/%s', username, username))

        const membershipId = player.Response[0].membershipId

        traveler.getProfile('2', membershipId, { components: 100 })
          .then((profile) => {
            const characterIds = profile.Response.profile.data.characterIds

            for (let i = 0; i < characterIds.length; i++) {
              request.post(
                delayedResponseUrl,
                {
                  json: {
                    response_type: 'in_channel',
                    text: characterIds[i]
                  }
                }
              )
            }
          })
      }
    })
})

const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log('Slack Raid Reporter listening on localhost:%s', port)
})