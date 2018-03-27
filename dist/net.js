'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
		key: 'initialResponse',
		value: function initialResponse(response, username) {
			response.send(JSON.stringify({
				response_type: 'in_channel',
				text: _util2.default.format('Processing request! Here\'s the raid.report in the meantime: https://raid.report/ps/%s', username)
			}));
		}

		/**
   * POSTs followup responses to the delayed response url included with the original slack request. Uses the Request package.
   * 
   * @param  {string} url - the url we will POST to
   * @param  {number} completions - total number of completions for the user
   * @param  {mixed} error - defaults false. if included, represents the Error object caught in a Promise
   */

	}, {
		key: 'delayedResponse',
		value: function delayedResponse(url, completions) {
			var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			var text = '';

			if (error && error.message) {
				text = error.message;
			} else {
				text = _util2.default.format('This user has %d completions in total on PSN.', completions);
			}

			_request2.default.post(url, {
				json: {
					response_type: 'in_channel',
					text: text
				}
			});
		}
	}]);

	return Net;
}();

var net = new Net();
exports.default = net;