const axios = require('axios');

module.exports = class PubgRankAPI {
  urlSearchPlayerAPI = "https://api.pubg.com/shards/kakao/players";
  urlSeasonListAPI = "https://api.pubg.com/shards/kakao/seasons";
  urlSeasonRankAPI = "https://api.pubg.com/shards/kakao/players/{accountId}/seasons/{seasonId}/ranked";
  gameType = "squad";
  seasonList = [];
  currentSeasonKey = "";
  currentKeySeq = 0;
  apiKeyList = [];

  constructor(apiKey) {
    this.apiKeyList = apiKey.split(",");
  }

  getPromisePubgAPI(url, params) {
    if (this.currentKeySeq >= this.apiKeyList.length) {
      this.currentKeySeq = 0;
    }

    const headers = {
      Authorization: "Bearer " + this.apiKeyList[this.currentKeySeq],
      Accept: "application/vnd.api+json"
    };
    this.currentKeySeq++;

    if (params != null) {
      const queryString = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
      url += "?" + queryString;
    }

    return new Promise((resolve, reject) => {
      axios.get(url, { headers }).then(res => {
        try {
          const jsonStr = JSON.stringify(res.data);
          const byteSize = Buffer.byteLength(jsonStr, 'utf8');
          const readableSize = byteSize < 1024
            ? `${byteSize} Bytes`
            : byteSize < 1024 * 1024
            ? `${(byteSize / 1024).toFixed(2)} KB`
            : `${(byteSize / (1024 * 1024)).toFixed(2)} MB`;

          console.log(`[Memory Estimate] ${url} → ${readableSize}`);
        } catch (e) {
          console.warn(`[Memory Estimate] Failed to calculate memory usage:`, e.message);
        }

        resolve(res);
      }).catch(err => {
        const errorObject = {
          url,
          errorCode: err.response?.status || 500,
          errorMessage: err.response?.statusText || err.message || "Unknown error"
        };
        reject(errorObject);
      });
    });
  }

  async setSeasonList() {
    const response = await this.getPromisePubgAPI(this.urlSeasonListAPI, {});
    const seasonListData = response.data.data;
    if (Array.isArray(seasonListData)) {
      seasonListData.forEach(seasonInfo => {
        const seasonId = seasonInfo.id;
        this.seasonList.push(seasonId);
        if (seasonInfo.attributes.isCurrentSeason === true) {
          this.currentSeasonKey = seasonId;
        }
      });
    }
  }

  async getPlayerRankList(playerNames, seasonKey = null) {
    const userInfoMap = {};
    const this_ = this;

    if (!seasonKey) {
      if (!this.currentSeasonKey) {
        await this.setSeasonList();
      }
      seasonKey = this.currentSeasonKey;
    }

    try {
      const playerRes = await this.getPromisePubgAPI(this.urlSearchPlayerAPI, {
        "filter[playerNames]": playerNames
      });

      const players = playerRes.data.data;
      if (Array.isArray(players)) {
        players.forEach(player => {
          const name = player.attributes.name;
          const id = player.id;
          userInfoMap[id] = { name };
        });
      }

      for (const accountId of Object.keys(userInfoMap)) {
        try {
          const rankRes = await this_.getPromisePlayerRank(accountId, seasonKey);
          const stats = rankRes.data.data.attributes.rankedGameModeStats;
          if (stats && stats[this_.gameType]) {
            const modeStats = stats[this_.gameType];
            userInfoMap[accountId].currentTier = modeStats.currentTier;
            userInfoMap[accountId].currentRankPoint = modeStats.currentRankPoint;
          }
        } catch (err) {
          userInfoMap[accountId].errorMessage = `[${err.errorCode}] ${err.errorMessage}`;
        }
      }

    } catch (outerErr) {
      console.error("Fatal error while fetching player list:", outerErr);
    }

    return userInfoMap;
  }

  getPromisePlayerRank(accountId, seasonId) {
    let url = this.urlSeasonRankAPI.replace("{accountId}", accountId).replace("{seasonId}", seasonId);
    return this.getPromisePubgAPI(url, { "filter[gamepad]": false });
  }
};
