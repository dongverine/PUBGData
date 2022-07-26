const assert = require('assert');
const NickelbackPubgAPI = require('../custom_modules/NickelbackPubgAPI.js')

describe('TEST ROOT', () => {
  describe('PUBB API TEST', () => {
    it('URL Call Test', () => {
        //console.log("test start");
        let testApi = new NickelbackPubgAPI();
        let playerNames = new Array();
        playerNames.push("datars");
        playerNames.push("bleumer102");
        let responseJson = testApi.getPlayerInfo(playerNames);
    });
    it('sample', () => {
      assert.equal([1, 2, 3].indexOf(2), 1);
    })    
  });
});