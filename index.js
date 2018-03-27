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

function initialResponse(response, username) {
  response.send(JSON.stringify({
    response_type: 'in_channel',
    text: util.format('Processing request! Here\'s the raid.report in the meantime: https://raid.report/ps/%s', username)
  }))
}

function delayedResponse(url, completions, error=false) {
  let text = ''

  if (error && error.message) {
    text = error.message
  } else {
    text = util.format('This user has %d completions total on PSN.', completions)
  }

  request.post(
    url, 
    {
      json: {
        response_type: 'in_channel',
        text: text
      }
    }
  )
}

function getPlayer(username) {
  return traveler.searchDestinyPlayer(2, username)
}

function getProfile(player) {
  if (player.Response.length === 0) {
    throw new Error('Couldn\'t find that user on PSN :(')
  } else {
    const membershipId = player.Response[0].membershipId

    return traveler.getProfile(2, membershipId, { components: 100 })
  }
}

function getCharacterStats(profile) {
  const membershipId = profile.Response.profile.data.userInfo.membershipId
  const characterIds = profile.Response.profile.data.characterIds

  let promises = []

  for (const characterId of characterIds) {
    promises.push(traveler.getHistoricalStats(2, membershipId, characterId, { groups: 1, modes: 4, periodType: 2 }))
  }

  return Promise.all(promises)
}

app.post('/api/raid', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const username = req.body.text
  const delayedResponseUrl = req.body.response_url

  initialResponse(res, username)

  getPlayer(username)
    .then((player) => getProfile(player))
    .then((profile) => getCharacterStats(profile))
    .then((stats) => {
      let completions = 0

      for (const character of stats) {
        completions += character.Response.raid.allTime.activitiesCleared.basic.value
      }

      delayedResponse(delayedResponseUrl, completions)
    })
    .catch((error) => {
      delayedResponse(delayedResponseUrl, 0, error)
    })
})

// app.post('/api/raid', function(req, res) {
//   res.setHeader('Content-Type', 'application/json')

//   const username = req.body.text
//   const delayedResponseUrl = req.body.response_url

//   traveler.searchDestinyPlayer('2', username)
//     .then((player) => {
//       if (player.Response.length === 0) {
//         // respondToInitialSlackRequest(res, util.format('Couldn\'t find the user %s on PSN', username))
//       } else {
//         // respondToInitialSlackRequest(res, util.format('Retrieving data for user %s on PSN...Here\'s their raid.report in the meantime: https://raid.report/ps/%s', username, username))

//         const membershipId = player.Response[0].membershipId

//         traveler.getProfile('2', membershipId, { components: 100 })
//           .then((profile) => {
//             const characterIds = profile.Response.profile.data.characterIds
//             let completions = []

//             for (let i = 0; i < characterIds.length; i++) {
//               completions.push(getStats(membershipId, characterIds[i]))
//             }

//             console.log(completions)

//             respondToInitialSlackRequest(res, JSON.stringify(completions))
//           })
//       }
//     })
// })

const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log('Slack Raid Reporter listening on localhost:%s', port)
})