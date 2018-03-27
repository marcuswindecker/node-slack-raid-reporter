import Traveler from 'the-traveler'
import Enums from 'the-traveler/build/enums'

class Raid {
	constructor() {
		this.traveler = new Traveler({
		  apikey: process.env.BUNGIE_API_KEY,
		  userAgent: 'slack'
		});
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
	  if (player.Response.length === 0) {
	    throw new Error('Couldn\'t find that user on PSN :(')
	  } else {
	    const membershipId = player.Response[0].membershipId

	    return this.traveler.getProfile(2, membershipId, { components: 100 })
	  }
	}

	/**
	 * Retrieves a Stats object from the Bungie API
	 * 
	 * @param  {object} profile - the Profile object retrieved in getProfile()
	 * @return {Promise} - issues a Stats request for each character in the profile and merge the results into a single resolved Promise
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
}

const raid = new Raid()
export default raid