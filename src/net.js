import util from 'util'
import request from 'request'

class Net {
	constructor(){}

	/**
	 * Responds to the initial slack request in order to satisfy the 3sec initial response window.
	 * 
	 * @param  {object} response - the Express res object
	 * @param  {string} username - the username included in the slack request
	 */
	initialResponse(response, username) {
	  response.send(JSON.stringify({
	    response_type: 'in_channel',
	    text: util.format('Processing request! Here\'s the raid.report in the meantime: https://raid.report/ps/%s', username)
	  }))
	}

	/**
	 * POSTs followup responses to the delayed response url included with the original slack request. Uses the Request package.
	 * 
	 * @param  {string} url - the url we will POST to
	 * @param  {number} completions - total number of completions for the user
	 * @param  {mixed} error - defaults false. if included, represents the Error object caught in a Promise
	 */
	delayedResponse(url, completions, error=false) {
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
}

const net = new Net()
export default net