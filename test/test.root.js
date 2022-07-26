const assert = require('assert');
const NickelbackPubgAPI = require('../custom_modules/NickelbackPubgAPI.js')

describe('TEST ROOT', () => {
  describe('PUBB API TEST', () => {
    it('URL Call Test', () => {
        //console.log("test start");
        let testApi = new NickelbackPubgAPI();
        let responseJson = testApi.getPlayerRankList("dators,bleumer102,77cloud,gasip");
    });
    it('sample', () => {
      assert.equal([1, 2, 3].indexOf(2), 1);
    })    
  });
});