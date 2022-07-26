let https = require('https');

module.exports = class NickelbackPubgAPI{
  constructor(){
    this.pubgAPIUrl = "https://api.pubg.com/shards/steam/players";
    this.pubgAPIOptions = {
        //url: 'https://api.pubg.com/shards/steam/players',
        hostname: 'api.pubg.com',
        port: 443,
        path : '/shards/kakao/players',
        method : 'GET',
        headers:{
          Authorization : "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJmYmQwNjIzMC1lYWU5LTAxM2EtMDI0MS0zZmMxNDI3YjYzYWUiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjU4MzgzOTMyLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImZyaWVuZHN0YXRpc3RpIn0.6UFJrWkfyPWblw_k_9AXNQl3pYe7bdLVEQxU3Mp2tfE",
          Accept : "application/vnd.api+json"
        }
    };
  }

  /**
   * 
   * @param {JsonObject} resJson (API서버에서 응답받은 JSON) 
   * @returns string (에러메시지)
   */
  getErrorMessage(resJson){
    if(resJson.errors!=null){
      let errorMessage = "";
      if(Array.isArray(resJson.errors)){
        errorMessage = resJson.errors[0].title;
        if(resJson.errors[0].detail!=null){
          errorMessage += " <" + resJson.errors[0].detail+">";
        }
      }
      return errorMessage;
    }else{
      return null;
    }
  }

  /**
   * 
   * @param {Array} playerNames 
   * @returns 
   */
  getPlayerInfo(playerNames){
    let responseJson = {};
    let this_ = this;
    
    let url = this.pubgAPIUrl + "?filter[playerNames]=dators";
    // let cloneOptions = Object.assign({}, this.pubgAPIOptions);//원본 훼손을 막기위해 option내용을 복사해서 사용한다.
    // cloneOptions.form = {};
    // cloneOptions.form["filter[playerNames]"] = playerNames.join(","); //플레이어 이름을 ,로 합쳐서 string으로 반환(array[a,b,c] = string[a,b,c])
    // console.log("       paramOption : \n",cloneOptions);
    console.log(url);
    const req = https.get(url, this.pubgAPIOptions, function(res){
      let resData = '';
      res.on('data', function(chunk){
          console.log("       1. reading....");
          resData += chunk;
      });
      
      res.on('end', function(){
          console.log("       2. read end.");
          responseJson = JSON.parse(resData);//string을 json형태로 파싱.....
          console.log("       3. parsed json");
          let errorMessage = this_.getErrorMessage(responseJson);
          if(errorMessage!=null){
            console.log("       error : "+errorMessage);
            throw errorMessage;
          }
      });
    });

    req.on('error', error => {
      throw error;
      //console.error(error);
    });
    req.end();

    return responseJson;
  }
}