import Traveler from 'the-traveler'
import prettyMs from 'pretty-ms'
import util from 'util'

/**
 * Handles data retrieval from The Traveler and formats stats
 */
class Raid {

  /**
   * @constructor
   */
  constructor() {

    /* eslint-disable no-undef */
    // init the traveler and enumerations
    this.traveler = new Traveler({
      apikey: process.env.BUNGIE_API_KEY,
      userAgent: 'the-speaker'
    })
    this.enums = require('the-traveler/build/enums')
    /* eslint-enable no-undef */

    // store activity hash values for later use
    this.activityHashes = {
      leviathan: '2693136602',
      eaterOfWorlds: '3089205900'
    }
  }

  /**
   * Parses the request text from Slack into an object
   *
   * @param  {string} requestText - the request text from Slack
   * @throws {Error} - throws an error if the request text is blank or contains too many params
   * @return {Promise} - resolves to an object containing the player's username and platform
   */
  parseRequest(requestText) {
    const promise = new Promise((resolve) => {
      if (requestText === '') {
        // no params sent
        throw new Error('I don\'t understand that request :(')
      }
      else {
        // split the request text at the space character
        const splitText = requestText.split(' ')
        let platform, username

        // no platform is present - default to PSN
        if (splitText.length === 1) {
          platform = 'psn'
          username = splitText[0]
        }
        // platform is present
        else if (splitText.length === 2) {
          platform = splitText[0]
          username = splitText[1]
        }
        else {
          // too many params sent
          throw new Error('I don\'t understand that request :(')
        }

        const parsedRequest = {
          platform: platform,
          username: username
        }

        resolve(parsedRequest)
      }
    })

    return promise
  }

  /**
   * Formats the object we'll use to send data back to Slack
   *
   * @param  {object} stats - the Stats object retrieved in one of: this.getCharacterStats(), this.getActivityStats()
   * @return {Promise} - Resolves after all of the stats are calculated and the formattedStats object built
   */
  formatStats(stats) {
    const promise = new Promise((resolve) => {
      let entered = 0
      let completions = 0
      const fastestTimes = []

      // loop over the characters and consolidate their stats
      for (const character of stats) {
        entered += character.Response.raid.allTime.activitiesEntered.basic.value
        completions += character.Response.raid.allTime.activitiesCleared.basic.value

        // exclude characters that haven't completed the raid
        if (character.Response.raid.allTime.fastestCompletionMs.basic.value > 0) {
          fastestTimes.push(character.Response.raid.allTime.fastestCompletionMs.basic.value)
        }
      }

      // handle the 0ms case - what causes it (ex: psn-jfernandez1988)?
      let fastestTime = 0
      if (fastestTimes.length) {
        // convert the fastest time from ms to a readable time
        fastestTime = prettyMs(Math.min(...fastestTimes), { secDecimalDigits: 0 })
      }

      // put all the good stuff together
      const formattedStats = {
        username: this.username,
        platform: this.platform.name,
        completions: completions,
        completion_pct: completions / entered,
        fastest_time: fastestTime
      }

      resolve(formattedStats)
    })

    return promise
  }

  /**
   * Retrieves a Player object from the Bungie API
   *
   * @param {string} parsedRequest - the request text from Slack after it's been through this.parseRequest()
   * @return {Promise} - resolves to a Player object from the Bungie API
   */
  getPlayer(parsedRequest) {
    const platform = parsedRequest.platform
    const username = parsedRequest.username

    // set the platform and username class properties
    switch (platform) {
      case 'pc':
        this.platform = {
          code: this.enums.BungieMembershipType.PC,
          name: 'PC'
        }
        break

      case 'xbox':
        this.platform = {
          code: this.enums.BungieMembershipType.Xbox,
          name: 'XBOX'
        }
        break

      case 'psn':
      default:
        this.platform = {
          code: this.enums.BungieMembershipType.PSN,
          name: 'PSN'
        }
        break
    }

    this.username = username

    return this.traveler.searchDestinyPlayer(
      this.platform.code,
      this.username
    )
  }

  /**
   * Retrieves a Profile object from the Bungie API
   *
   * @param  {object} player - the Player object retrieved in getPlayer()
   * @throws {Error} - throws an Error if the Player data wasn't populated in the response from getPlayer()
   * @return {Promise} - resolves to a Profile object from the Bungie API
   */
  getProfile(player) {
    // player wasn't found
    if (!player.Response.length) {
      throw new Error(util.format('Couldn\'t find %s on %s :(', this.username, this.platform.name))
    }
    // player was found
    else {
      this.membershipId = player.Response[0].membershipId

      return this.traveler.getProfile(
        this.platform.code,
        this.membershipId,
        {
          components: this.enums.ComponentType.Profiles
        }
      )
    }
  }

  /**
   * Retrieves a Character Stats object from the Bungie API
   *
   * @param  {object} profile - the Profile object retrieved in getProfile()
   * @return {Promise} - issues a Character Stats request for each character in the profile and merge the results into a single resolved Promise
   */
  getCharacterStats(profile) {
    this.characterIds = profile.Response.profile.data.characterIds

    const promises = []

    // build a separate promise to get stats for each character
    for (const characterId of this.characterIds) {
      promises.push(
        this.traveler.getHistoricalStats(
          this.platform.code,
          this.membershipId,
          characterId,
          {
            groups: this.enums.DestinyStatsGroupType.General,
            modes: this.enums.DestinyActivityModeType.Raid,
            periodType: this.enums.PeriodType.AllTime
          }
        )
      )
    }

    return Promise.all(promises)
  }

  /**
   * Retrieves an Activity Stats object from the Bungie API
   *
   * @param  {object} profile - the Profile object retrieved in getProfile()
   * @return {Promise} - issues an Activity Stats request for each character in the profile and merge the results into a single resolved Promise
   */
  getActivityStats(profile) {
    this.characterIds = profile.Response.profile.data.characterIds

    const promises = []

    // build a separate promise to get stats for each character
    for (const characterId of this.characterIds) {
      promises.push(
        this.traveler.getAggregateActivityStats(
          this.platform.code,
          this.membershipId,
          characterId
        )
      )
    }

    return Promise.all(promises)
  }
}

const raid = new Raid()
export default raid
