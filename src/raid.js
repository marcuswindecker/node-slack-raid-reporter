import Traveler from 'the-traveler'
import Enums from 'the-traveler/build/enums'

class Raid {
	constructor() {
		this.traveler = new Traveler({
		  apikey: process.env.BUNGIE_API_KEY,
		  userAgent: 'slack'
		});

		this.leviathanHash = '2693136602'
		this.eaterOfWorldsHash = '3089205900'
	}

	/**
	 * Builds the response object we'll use to send data back to Slack
	 * 
	 * @param  {object} stats - the Stats object retrieved in one of: this.getCharacterStats(), this.getActivityStats()
	 * @return {Promise} - Resolves after all of the stats are calculated and the response object built
	 */
	buildStatsResponse(stats) {
		const promise = new Promise((resolve) => {
			let entered = 0
	    let completions = 0
	    const fastestTimes = []

	    for (const character of stats) {
	      entered += character.Response.raid.allTime.activitiesEntered.basic.value
	      completions += character.Response.raid.allTime.activitiesCleared.basic.value
	      fastestTimes.push(character.Response.raid.allTime.fastestCompletionMs.basic.displayValue)
	    }

	    const statsResponse = {
	    	completions: completions,
	    	completion_pct: completions / entered,
	    	fastest_times: fastestTimes
	    }

			resolve(statsResponse)
		})

		return promise
	}

	/**
	 * Retrieves a Player object from the Bungie API
	 * 
	 * @param  {string} username - the username included in the slack request
	 * @return {Promise} - resolves to a Player object from the Bungie API
	 */
	getPlayer(username) {
	  return this.traveler.searchDestinyPlayer(2, username)
	}

	/**
	 * Retrieves a Profile object from the Bungie API 
	 * 
	 * @param  {object} player - the Player object retrieved in getPlayer()
	 * @throws {Error} - throws an Error if the Player data wasn't populated in the response from getPlayer()
	 * @return {Promise} - resolves to a Profile object from the Bungie API
	 */
	getProfile(player) {
	  if (!player.Response.length) {
	    throw new Error('Couldn\'t find that user on PSN :(')
	  } else {
	    const membershipId = player.Response[0].membershipId

	    return this.traveler.getProfile(2, membershipId, { components: 100 })
	  }
	}

	/**
	 * Retrieves a Character Stats object from the Bungie API
	 * 
	 * @param  {object} profile - the Profile object retrieved in getProfile()
	 * @return {Promise} - issues a Character Stats request for each character in the profile and merge the results into a single resolved Promise
	 */
	getCharacterStats(profile) {
	  const membershipId = profile.Response.profile.data.userInfo.membershipId
	  const characterIds = profile.Response.profile.data.characterIds

	  let promises = []

	  for (const characterId of characterIds) {
	    promises.push(this.traveler.getHistoricalStats(2, membershipId, characterId, { groups: 1, modes: 4, periodType: 2 }))
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
		const membershipId = profile.Response.profile.data.userInfo.membershipId
	  const characterIds = profile.Response.profile.data.characterIds

	  let promises = []

	  for (const characterId of characterIds) {
	    promises.push(this.traveler.getAggregateActivityStats(2, membershipId, characterId))
	  }

	  return Promise.all(promises)
	}
}

const raid = new Raid()
export default raid