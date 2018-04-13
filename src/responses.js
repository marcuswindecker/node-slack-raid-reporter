import util from 'util'

/**
 * Helper library used to build Response bodies
 */
class Responses {
  constructor() {}

  /**
   * Builds the initial response sent back to satisfy the 3sec Slack timeout
   * 
   * @param  {string} username - the username sent with the initial Slack request
   * @return {object} response - the initial response body to send back to Slack
   */
  buildInitialResponse() {
    const response = {
      response_type: 'in_channel',
      text: 'I\'m consulting with the Traveler...'
    }

    return response
  }
  
  /**
   * Builds an error response to send back to Slack
   * 
   * @param  {Error} error - an Error object
   * @return {object} response - the error response body to send back to Slack
   */
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

  /**
   * Builds a success response to send back to Slack
   * 
   * @param  {object} stats - the formatted stats object
   * @return {object} response - the success response body to send back to Slack
   */
  buildSuccessResponse(stats) {
    const response = {
      response_type: 'in_channel',
      text: 'Here are the detailed stats:',
      attachments: [{
        fallback: util.format('This user has %d completions in total on PSN.', stats.completions),
        fields: [
          {
            title: 'Total Completions',
            value: stats.completions,
            short: true
          },
          {
            title: 'Completion Percentage',
            value: Math.round(stats.completion_pct * 100) + '%',
            short: true
          },
          {
            title: 'Fastest Time',
            value: stats.fastest_time,
            short: true
          }
        ],
        color: 'good'
      }]
    }

    return response
  }
}

const responses = new Responses()
export default responses