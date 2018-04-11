'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _responses = require('./responses');

var _responses2 = _interopRequireDefault(_responses);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class is used to respond to Slack requests at various points in the workflow
 */
var Net = function () {
  function Net() {
    _classCallCheck(this, Net);
  }

  /**
   * Responds to the initial slack request in order to satisfy the 3sec initial response window.
   * 
   * @param  {object} response - the Express res object
   * @param  {string} username - the username included in the slack request
   */


  _createClass(Net, [{
    key: 'sendInitialResponse',
    value: function sendInitialResponse(res, username) {
      var initialResponse = _responses2.default.buildInitialResponse(username);

      res.send(JSON.stringify(initialResponse));
    }

    /**
     * POSTs followup responses to the delayed response url included with the original slack request. Uses the Request package.
     * 
     * @param  {string} url - the url we will POST to
     * @param  {object} statsResponse - the statsResponse object built in raid.buildStatsResponse()
     * @param  {mixed} error - defaults false. if included, represents the Error object caught in a Promise
     */

  }, {
    key: 'sendDelayedResponse',
    value: function sendDelayedResponse(url, statsResponse) {
      var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var responseBody = {};

      if (error && error.message) {
        responseBody = _responses2.default.buildErrorResponse(error);
      } else {
        responseBody = _responses2.default.buildSuccessResponse(statsResponse);
      }

      _request2.default.post(url, {
        json: responseBody
      });
    }
  }]);

  return Net;
}();

var net = new Net();
exports.default = net;