const axios = require('axios');

module.exports = class NickelbackPubgAPI{
  urlSearchPlayerAPI = "https://api.pubg.com/shards/kakao/players";
  urlSeasonListAPI = "https://api.pubg.com/shards/kakao/seasons";
  urlSeasonRankAPI = "https://api.pubg.com/shards/kakao/players/{accountId}/seasons/{seasonId}/ranked";
  gameType = "squad";
  seasonList = [];//시즌정보 key List를 가진다.
  currentSeasonKey = "";

  constructor(){
    let this_ = this;    
    //공통 api호출 변수 설정 (api키)
    this.pubgAPIHeader = {
        headers : {
          Authorization : "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmYmQwNjIzMC1lYWU5LTAxM2EtMDI0MS0zZmMxNDI3YjYzYWUiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjU4MzgzOTMyLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImZyaWVuZHN0YXRpc3RpIn0.6UFJrWkfyPWblw_k_9AXNQl3pYe7bdLVEQxU3Mp2tfE",
          Accept : "application/vnd.api+json"
        }
    };
  }

  /**
   * PubgAPI를 사용하기위한 공통함수
   * @param {string} url 
   * @param {JsonObject} params 
   * @param {function} callback 
   */
   getPromisePubgAPI(url,params){
    let this_ = this;
    if(params!=null){
      let strParams = "";
      for(let paramKey in params){
        strParams += (strParams==""?"?":"&") + paramKey +"=" + params[paramKey];
      }
      url += strParams; 
    }    
    return new Promise(function(resolve, reject){
                  axios.get(url, this_.pubgAPIHeader).then((_responseJson)=>{
                    resolve(_responseJson)
                  }).catch(function(error){
                    let errorObject = {};
                    errorObject.errorCode = error.response.status;
                    errorObject.errorMessage = error.response.statusText;
                    reject(errorObject);
                  });
              });
  }

  async setSeasonList(){
    //시즌정보를 불러온다.
    let this_ = this;
    await this.getPromisePubgAPI(this.urlSeasonListAPI, {}).then(function(responseJson){
      /*
        //예시
        {
          "type": "season",
          "id": "division.bro.official.pc-2018-15",
          "attributes": {
            "isOffseason": false,
            "isCurrentSeason": true
          }
        },      
      */
      let seasonListData = responseJson.data.data;
      if(seasonListData!=null && Array.isArray(seasonListData)){
        seasonListData.forEach((seasonInfo, idx) =>{
          let seasonId = seasonInfo.id;
          this_.seasonList.push(seasonId);
          //isCurrentSeason 현재 시즌이 true인 값을 가져온다.
          if(seasonInfo.attributes.isCurrentSeason==true){
            console.log("current season : "+seasonId);
            this_.currentSeasonKey = seasonId;
          }
        });
      }
    });
  }

  // /**
  //  * 
  //  * @param {JsonObject} resJson (API서버에서 응답받은 JSON) 
  //  * @returns string (에러메시지)
  //  */
  //  getErrorMessage(resJson){
  //   if(resJson.errors!=null){
  //     let errorMessage = "";
  //     if(Array.isArray(resJson.errors)){
  //       errorMessage = resJson.errors[0].title;
  //       if(resJson.errors[0].detail!=null){
  //         errorMessage += " <" + resJson.errors[0].detail+">";
  //       }
  //     }
  //     return errorMessage;
  //   }else{
  //     return null;
  //   }
  // }
    
  /**
   * 플레이어 시즌 정보를 가져온다.
   * @param {string} playerNames
   * @param {string} seasonKey
   * @returns 
   */
   async getPlayerRankList(playerNames, seasonKey){
    //시즌정보를 가져옴
    await this.setSeasonList();
    let userInfoMap = {};
    let this_ = this;
    if(seasonKey==null)
      seasonKey = this.currentSeasonKey;
    await this.getPromisePubgAPI(this.urlSearchPlayerAPI, {"filter[playerNames]":playerNames})
      .then(async function(responseJson){
        /*
          //예시
            {
              "data": [
                {
                  "type": "player",
                  "id": "account.51525c5501b54c6fa643c88d9cf48bf3",
                  "attributes": {
                    "titleId": "pubg",
                    "shardId": "kakao",
                    "patchVersion": "",
                    "name": "dators",
                    "stats": null
                  },
                  "relationships": {
        */ 
        let userList = responseJson.data.data;
        if(userList!=null && Array.isArray(userList)){
          userList.forEach((userInfo,idx)=>{
            let userName = userInfo.attributes.name;
            let userid = userInfo.id;
            console.log(" userInfo ["+userName+"] : "+userid);
            userInfoMap[userid] = {};
            userInfoMap[userid].name = userName;
          });
        }

        //console.log("\n 1. userInfoMap : \n",userInfoMap);
        for(let userid in userInfoMap){
          try{
            await this_.getPromisePlayerRank(userid, this_.currentSeasonKey, this_.gameType).then(function(responseUserRankJson){
              /*
                {
                  type: 'rankedplayerstats',
                  attributes: { 
                    rankedGameModeStats: { 
                      squad : {
                        currentTier : {}
                        currentRankPoint : 000
                      }
                    } 
                  },              
              */
              let userRankInfo = responseUserRankJson.data.data.attributes.rankedGameModeStats;
              //console.log("userRankInfo : ",userRankInfo);
              if(userRankInfo.squad!=null && userRankInfo.squad.currentTier!=null){
                userInfoMap[userid].currentTier = userRankInfo.squad.currentTier;
                userInfoMap[userid].currentRankPoint = userRankInfo.squad.currentRankPoint;
              }
            }).catch(function(errorObject){
              console.log(errorObject);
              if(errorObject.errorCode!=null){
                let errorMessage = "["+errorObject.errorCode+"] " + errorObject.errorMessage;
                userInfoMap[userid].errorMessage = errorMessage;
              }
            });
          }catch(error){
            console.log("await promise error");
          }
        }
      }
    ).catch(function(errorMessage){
      console.log("errorMessage1 : "+errorMessage);
    });
    console.log("getPlayerRankList returned : ",userInfoMap);
    return userInfoMap;
  }

  getPromisePlayerRank(accountId, seasonId){
    let url = this.urlSeasonRankAPI;
    url = url.replace("{accountId}",accountId).replace("{seasonId}",seasonId);
    return this.getPromisePubgAPI(url, {"filter[gamepad]":false});
  }  
}