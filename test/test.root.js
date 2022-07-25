import { Test_Api as TestApi} from './test_api';
const assert = require('assert');

describe('API', () => {
  describe('CALL', () => {
    it('URL Call Test', () => {
        console.log("test start");
        debugger;
        let testApi = new TestApi();
        testApi.callUrl();
    });
    it('sample', () => {
      assert.equal([1, 2, 3].indexOf(2), 1);
    })    
  });
});