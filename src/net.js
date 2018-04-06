import util from 'util'
import request from 'request'

class Net {
	constructor(){}

	buildInitialResponse(username) {
		const response = {
	    response_type: 'in_channel',
	    text: util.format('Processing request! Here\'s the raid.report in the meantime: https://raid.report/ps/%s', username)
	  }

	  return response
	}
	
	buildErrorResponse(error) {
		const response = {
			response_type: 'in_channel',
	    attachments: [{
	    	fallback: error.message,
	    	text: error.message,
	    	color: 'danger'
	    }]
		}

		return response
	}

	buildSuccessResponse(stats) {
		const response = {
			response_type: 'in_channel',
			text: util.format('This user has %d completions in total on PSN.', stats.completions),
	    attachments: [{
	    	fallback: util.format('This user has %d completions in total on PSN.', stats.completions),
	    	text: util.format('Here\'s some other stats:', stats.completions),
	    	color: 'good'
	    }]
		}

		return response
	}

	/**
	 * Responds to the initial slack request in order to satisfy the 3sec initial response window.
	 * 
	 * @param  {object} response - the Express res object
	 * @param  {string} username - the username included in the slack request
	 */
	initialResponse(res, username) {
	  const initialResponse = this.buildInitialResponse(username)

	  res.send(JSON.stringify(initialResponse))
	}

	/**
	 * POSTs followup responses to the delayed response url included with the original slack request. Uses the Request package.
	 * 
	 * @param  {string} url - the url we will POST to
	 * @param  {object} statsResponse - the statsResponse object built in raid.buildStatsResponse()
	 * @param  {mixed} error - defaults false. if included, represents the Error object caught in a Promise
	 */
	delayedResponse(url, statsResponse, error=false) {
	  let responseBody = {}

	  if (error && error.message) {
	    responseBody = this.buildErrorResponse(error)
	  } else {
	   	responseBody = this.buildSuccessResponse(statsResponse)
	  }

	  request.post(
	    url, 
	    {
	      json: responseBody
	    }
	  )
	}
}

const net = new Net()
export default net