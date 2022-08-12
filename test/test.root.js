const assert = require('assert');
const PubgRankAPI = require('../custom_modules/PubgRankAPI.js')
const PropertiesReader = require('properties-reader');

describe('TEST ROOT', () => {
  describe('PUBB API TEST', () => {
    //this.timeout(15000);
    it('URL Call Test', async () => {
        const properties = PropertiesReader('setting.properties');
        const apiKey = properties.get("api.key");
        console.log("api.key = ",apiKey);
        let testApi = new PubgRankAPI(apiKey);
        let sortedRankUserList = [];
        let responseJson = {};

        try { 
            responseJson = await testApi.getPlayerRankList("dators,bleumer102,77cloud,gasip");
            console.log("getPlayerRankList returned : ",responseJson);
        }catch(error){
            console.error("getPlayerRankList error : ",error);
            return;
        }
        //배열에 넣는다.
        for(let accountId in responseJson){
            let userInfo = responseJson[accountId];
            sortedRankUserList.push(userInfo);
        }
        //점수 순서대로 배열 sort
        sortedRankUserList.sort(function(user1, user2){
            console.log("> sorting :",user1.name+"["+user1.currentRankPoint+"]", user2.name+"["+user2.currentRankPoint+"]");
            if(user1.errorMessage!=null || user1.currentRankPoint==null){
                return 1;
            }
            if(user2.errorMessage!=null || user2.currentRankPoint==null){
                return -1;
            }                    
            if(user1.currentRankPoint == user2.currentRankPoint){
                return 0;
            }else
            if(user1.currentRankPoint > user2.currentRankPoint){
                return -1;
            }else{
                return 1;
            }
        });
        //console.log("sortedRankUserList : ",sortedRankUserList);
        /*
            {
                name: 'dators',
                currentTier: { tier: 'Gold', subTier: '3' },
                currentRankPoint: 2204,
                errorMessage : ''
            },                    
        */
        var templateUserInfo = "";

        sortedRankUserList.forEach((userInfo, idx)=>{
            if(userInfo.errorMessage==null){
                var tier = userInfo.currentTier==null?"":userInfo.currentTier.tier;
                var subTier = userInfo.currentTier==null?"":userInfo.currentTier.subTier;                
                templateUserInfo += `\n[ ${userInfo.currentRankPoint} ] ${userInfo.name} ${tier} ${subTier}`;
            }else{
                templateUserInfo += `\n > Error ${userInfo.errorMessage} ${userInfo.name} }`;                        
            }
        });

        console.log("\n\n\n\n=======[TeamKill is my life] Rank======")
        console.log(templateUserInfo);
        console.log("\n==========================================\n\n");

    });
    // it('sample', () => {
    //   assert.equal([1, 2, 3].indexOf(2), 1);
    // })    
  });
});