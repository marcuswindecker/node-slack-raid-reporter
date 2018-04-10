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

		this.activityHashes = {
			leviathan: '2693136602',
			eaterOfWorlds: '3089205900'
		};
	}

	/**
  * Builds the response object we'll use to send data back to Slack
  * 
  * @param  {object} stats - the Stats object retrieved in one of: this.getCharacterStats(), this.getActivityStats()
  * @return {Promise} - Resolves after all of the stats are calculated and the response object built
  */


	_createClass(Raid, [{
		key: 'buildStatsResponse',
		value: function buildStatsResponse(stats) {
			var promise = new Promise(function (resolve) {
				var entered = 0;
				var completions = 0;
				var fastestTimes = [];

				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = stats[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var character = _step.value;

						entered += character.Response.raid.allTime.activitiesEntered.basic.value;
						completions += character.Response.raid.allTime.activitiesCleared.basic.value;
						fastestTimes.push(character.Response.raid.allTime.fastestCompletionMs.basic.displayValue);
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

				var statsResponse = {
					completions: completions,
					completion_pct: completions / entered,
					fastest_times: fastestTimes
				};

				resolve(statsResponse);
			});

			return promise;
		}

		/**
   * Retrieves a Player object from the Bungie API
   * 
   * @param  {string} username - the username included in the slack request
   * @return {Promise} - resolves to a Player object from the Bungie API
   */

	}, {
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
			if (!player.Response.length) {
				throw new Error('Couldn\'t find that user on PSN :(');
			} else {
				var membershipId = player.Response[0].membershipId;

				return this.traveler.getProfile(2, membershipId, { components: 100 });
			}
		}

		/**
   * Retrieves a Character Stats object from the Bungie API
   * 
   * @param  {object} profile - the Profile object retrieved in getProfile()
   * @return {Promise} - issues a Character Stats request for each character in the profile and merge the results into a single resolved Promise
   */

	}, {
		key: 'getCharacterStats',
		value: function getCharacterStats(profile) {
			var membershipId = profile.Response.profile.data.userInfo.membershipId;
			var characterIds = profile.Response.profile.data.characterIds;

			var promises = [];

			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = characterIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var characterId = _step2.value;

					promises.push(this.traveler.getHistoricalStats(2, membershipId, characterId, { groups: 1, modes: 4, periodType: 2 }));
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return Promise.all(promises);
		}

		/**
   * Retrieves an Activity Stats object from the Bungie API
   * 
   * @param  {object} profile - the Profile object retrieved in getProfile()
   * @return {Promise} - issues an Activity Stats request for each character in the profile and merge the results into a single resolved Promise
   */

	}, {
		key: 'getActivityStats',
		value: function getActivityStats(profile) {
			var membershipId = profile.Response.profile.data.userInfo.membershipId;
			var characterIds = profile.Response.profile.data.characterIds;

			var promises = [];

			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = characterIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var characterId = _step3.value;

					promises.push(this.traveler.getAggregateActivityStats(2, membershipId, characterId));
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
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