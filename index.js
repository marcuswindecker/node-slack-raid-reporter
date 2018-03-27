// require external libs
const dotenv = require('dotenv')
const Traveler = require('the-traveler').default
const Enums = require('the-traveler/build/enums')
const bodyParser = require('body-parser')
const util = require('util')
const request = require('request')
const express = require('express')

// require custom libs
const test = require('./dist/test.js').default

// init Express
const app = express()

// init request parsing lib and dotenv
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config()

// init a Traveler object to work with
const traveler = new Traveler({
  apikey: process.env.BUNGIE_API_KEY,
  userAgent: 'slack'
});

/**
 * Responds to the initial slack request in order to satisfy the 3sec initial response window.
 * 
 * @param  {object} response - the Express res object
 * @param  {string} username - the username included in the slack request
 */
function initialResponse(response, username) {
  response.send(JSON.stringify({
    response_type: 'in_channel',
    // text: util.format('Processing request! Here\'s the raid.report in the meantime: https://raid.report/ps/%s', username)
    text: test.test()
  }))
}

/**
 * POSTs followup responses to the delayed response url included with the original slack request. Uses the Request package.
 * 
 * @param  {string} url - the url we will POST to
 * @param  {number} completions - total number of completions for the user
 * @param  {mixed} error - defaults false. if included, represents the Error object caught in a Promise
 */
function delayedResponse(url, completions, error=false) {
  let text = ''

  if (error && error.message) {
    text = error.message
  } else {
    text = util.format('This user has %d completions in total on PSN.', completions)
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

/**
 * Retrieves a Player object from the Bungie API
 * 
 * @param  {string} username - the username included in the slack request
 * @return {Promise} - resolves to a Player object from the Bungie API
 */
function getPlayer(username) {
  return traveler.searchDestinyPlayer(2, username)
}

/**
 * Retrieves a Profile object from the Bungie API 
 * 
 * @param  {object} player - the Player object retrieved in getPlayer()
 * @throws {Error} - throws an Error if the Player data wasn't populated in the response from getPlayer()
 * @return {Promise} - resolves to a Profile object from the Bungie API
 */
function getProfile(player) {
  if (player.Response.length === 0) {
    throw new Error('Couldn\'t find that user on PSN :(')
  } else {
    const membershipId = player.Response[0].membershipId

    return traveler.getProfile(2, membershipId, { components: 100 })
  }
}

/**
 * Retrieves a Stats object from the Bungie API
 * 
 * @param  {object} profile - the Profile object retrieved in getProfile()
 * @return {Promise} - issues a Stats request for each character in the profile and merge the results into a single resolved Promise
 */
function getCharacterStats(profile) {
  const membershipId = profile.Response.profile.data.userInfo.membershipId
  const characterIds = profile.Response.profile.data.characterIds

  let promises = []

  for (const characterId of characterIds) {
    promises.push(traveler.getHistoricalStats(2, membershipId, characterId, { groups: 1, modes: 4, periodType: 2 }))
  }

  return Promise.all(promises)
}

//------------- ENDPOINTS START HERE ------------------//
app.post('/api/raid', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const username = req.body.text
  const delayedResponseUrl = req.body.response_url

  initialResponse(res, username)

  getPlayer(username)
    .then((player) => getProfile(player))
    .then((profile) => getCharacterStats(profile))
    .then((stats) => {
      console.log(test.test())

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

//------------- SERVER STARTS HERE ------------------//
const server = app.listen(process.env.PORT || 3000, function () {
  const port = server.address().port
  console.log('Slack Raid Reporter listening on localhost:%s', port)
})