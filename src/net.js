import request from 'request'
import responses from './responses'

/**
 * This class is used to respond to Slack requests at various points in the workflow
 */
class Net {
  constructor(){}

  /**
   * Responds to the initial slack request in order to satisfy the 3sec initial response window.
   * 
   * @param  {object} response - the Express res object
   * @param  {string} username - the username included in the slack request
   */
  sendInitialResponse(res, username) {
    const initialResponse = responses.buildInitialResponse(username)

    res.send(JSON.stringify(initialResponse))
  }

  /**
   * POSTs followup responses to the delayed response url included with the original slack request. Uses the Request package.
   * 
   * @param  {string} url - the url we will POST to
   * @param  {object} statsResponse - the statsResponse object built in raid.buildStatsResponse()
   * @param  {mixed} error - defaults false. if included, represents the Error object caught in a Promise
   */
  sendDelayedResponse(url, statsResponse, error=false) {
    let responseBody = {}

    if (error && error.message) {
      responseBody = responses.buildErrorResponse(error)
    } else {
      responseBody = responses.buildSuccessResponse(statsResponse)
    }

    request.post(url, {
      json: responseBody
    })
  }
}

const net = new Net()
export default net