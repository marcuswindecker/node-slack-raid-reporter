'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _theTraveler = require('the-traveler');

var _theTraveler2 = _interopRequireDefault(_theTraveler);

var _prettyMs = require('pretty-ms');

var _prettyMs2 = _interopRequireDefault(_prettyMs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles data retrieval from The Traveler and formats stats
 */
var Raid = function () {
  function Raid() {
    _classCallCheck(this, Raid);

    this.traveler = new _theTraveler2.default({
      apikey: process.env.BUNGIE_API_KEY,
      userAgent: 'the-speaker'
    });

    this.enums = require('the-traveler/build/enums');

    this.activityHashes = {
      leviathan: '2693136602',
      eaterOfWorlds: '3089205900'
    };
  }

  _createClass(Raid, [{
    key: 'parseRequest',
    value: function parseRequest(requestText) {
      var promise = new Promise(function (resolve) {
        if (requestText === '') {
          throw new Error('I don\'t understand that request :(');
        } else {
          var splitText = requestText.split(' ');
          var _platform = void 0,
              _username = void 0;

          if (splitText.length === 1) {
            _platform = 'psn';
            _username = splitText[0];
          } else if (splitText.length === 2) {
            _platform = splitText[0];
            _username = splitText[1];
          } else {
            throw new Error('I don\'t understand that request :(');
          }
        }

        var parsedRequest = {
          platform: platform,
          username: username
        };

        resolve(parsedRequest);
      });

      return promise;
    }

    /**
     * Formats the object we'll use to send data back to Slack
     * 
     * @param  {object} stats - the Stats object retrieved in one of: this.getCharacterStats(), this.getActivityStats()
     * @return {Promise} - Resolves after all of the stats are calculated and the formattedStats object built
     */

  }, {
    key: 'formatStats',
    value: function formatStats(stats) {
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

            if (character.Response.raid.allTime.fastestCompletionMs.basic.value > 0) {
              fastestTimes.push(character.Response.raid.allTime.fastestCompletionMs.basic.value);
            }
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

        var fastestTime = (0, _prettyMs2.default)(Math.min.apply(Math, fastestTimes), { secDecimalDigits: 0 });

        var formattedStats = {
          completions: completions,
          completion_pct: completions / entered,
          fastest_time: fastestTime
        };

        resolve(formattedStats);
      });

      return promise;
    }

    /**
     * Retrieves a Player object from the Bungie API
     *
     * @param {string} parsedRequest - the request text from Slack after it's been through this.parseRequest()
     * @return {Promise} - resolves to a Player object from the Bungie API
     */

  }, {
    key: 'getPlayer',
    value: function getPlayer(parsedRequest) {
      var platform = parsedRequest.platform;
      var username = parsedRequest.username;

      switch (platform) {
        case 'pc':
          this.platform = {
            code: this.enums.BungieMembershipType.PC,
            name: 'PC'
          };
          break;

        case 'xbox':
          this.platform = {
            code: this.enums.BungieMembershipType.Xbox,
            name: 'XBOX'
          };
          break;

        case 'psn':
        default:
          this.platform = {
            code: this.enums.BungieMembershipType.PSN,
            name: 'PSN'
          };
          break;
      }

      this.username = username;

      return this.traveler.searchDestinyPlayer(this.platform.code, this.username);
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
        throw new Error(_util2.default.format('Couldn\'t find %s on %s :(', this.username, this.platform.name));
      } else {
        net.sendInitialResponse(res, username);

        this.membershipId = player.Response[0].membershipId;

        return this.traveler.getProfile(this.platform.code, this.membershipId, {
          components: this.enums.ComponentType.Profiles
        });
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
      this.characterIds = profile.Response.profile.data.characterIds;

      var promises = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.characterIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var characterId = _step2.value;

          promises.push(this.traveler.getHistoricalStats(this.platform.code, this.membershipId, characterId, {
            groups: this.enums.DestinyStatsGroupType.General,
            modes: this.enums.DestinyActivityModeType.Raid,
            periodType: this.enums.PeriodType.AllTime
          }));
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
      this.characterIds = profile.Response.profile.data.characterIds;

      var promises = [];

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.characterIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var characterId = _step3.value;

          promises.push(this.traveler.getAggregateActivityStats(this.platform.code, this.membershipId, characterId));
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