'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _theTraveler = require('the-traveler');

var _theTraveler2 = _interopRequireDefault(_theTraveler);

var _enums = require('the-traveler/build/enums');

var _enums2 = _interopRequireDefault(_enums);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Raid = function () {
	function Raid() {
		_classCallCheck(this, Raid);

		this.traveler = new _theTraveler2.default({
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


	_createClass(Raid, [{
		key: 'getPlayer',
		value: function getPlayer(username) {
			return this.traveler.searchDestinyPlayer(2, username);
		}

		/**
   * Retrieves a Profile object from the Bungie API 
   * 
   * @param  {object} player - the Player object retrieved in getPlayer()
   * @throws {Error} - throws an Error if the Player data wasn't populated in the response from getPlayer()
   * @return {Promise} - resolves to a Profile object from the Bungie API
   */

	}, {
		key: 'getProfile',
		value: function getProfile(player) {
			if (player.Response.length === 0) {
				throw new Error('Couldn\'t find that user on PSN :(');
			} else {
				var membershipId = player.Response[0].membershipId;

				return this.traveler.getProfile(2, membershipId, { components: 100 });
			}
		}

		/**
   * Retrieves a Stats object from the Bungie API
   * 
   * @param  {object} profile - the Profile object retrieved in getProfile()
   * @return {Promise} - issues a Stats request for each character in the profile and merge the results into a single resolved Promise
   */

	}, {
		key: 'getCharacterStats',
		value: function getCharacterStats(profile) {
			var membershipId = profile.Response.profile.data.userInfo.membershipId;
			var characterIds = profile.Response.profile.data.characterIds;

			var promises = [];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = characterIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var characterId = _step.value;

					promises.push(this.traveler.getHistoricalStats(2, membershipId, characterId, { groups: 1, modes: 4, periodType: 2 }));
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return Promise.all(promises);
		}
	}]);

	return Raid;
}();

var raid = new Raid();
exports.default = raid;