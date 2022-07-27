var http = require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');
const NickelbackPubgAPI = require('./custom_modules/NickelbackPubgAPI.js')
//var app = express();


//var bb = apiInstance.loadPlayerById('77cloud');
//console.log(bb);


var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    //app.use(express.static('./img'));

   
    
    if(pathname === '/'){
        if(queryData.id === undefined){
            
            fs.readFile(`data/${queryData.id}`,'utf8', async function(err, description){

                let testApi = new NickelbackPubgAPI();
                let sortedRankUserList = [];
                let responseJson = {};
                try { 
                    responseJson = await testApi.getPlayerRankList("dators,bleumer102,77cloud,gasip");
                }catch(error){
                    console(error);
                }
                //배열에 넣는다.
                for(let accountId in responseJson){
                    let userInfo = responseJson[accountId];
                    sortedRankUserList.push(userInfo);
                }
                //점수 순서대로 배열 sort
                sortedRankUserList.sort(function(user1, user2){
                    console.log("sorting :",user1.name+"["+user1.currentRankPoint+"]", user2.name+"["+user2.currentRankPoint+"]");
                    if(user1.errorMessage!=null){
                        return 1;
                    }
                    if(user2.errorMessage!=null){
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
                console.log("sortedRankUserList : ",sortedRankUserList);
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
                        templateUserInfo += `<li>[ ${userInfo.currentRankPoint} ] ${userInfo.name} ${userInfo.currentTier.tier} ${userInfo.currentTier.subTier}</li>`;
                    }else{
                        templateUserInfo += `<li>Error ${userInfo.errorMessage} ${userInfo.name} }</li>`;                        
                    }
                });
                var title = 'For The Squard';
                var templateHeader = `
                <!doctype html>
                <html>
                <head>
                <title>PUBG Rank[TeamKillIsMyLife] - ${title}</title>
                <meta charset="utf-8">
                </head>
                <body>
                <h1>PUBG Statistic</h1>
                <h2>순위</h2>
                <ol>
                `;

                var templateTail = `
                </ol>
                </body>
                </html>
                
                `;                
                
                console.log("returned ");


                response.writeHead(200);    
                response.end(templateHeader + templateUserInfo + templateTail);
            } );
        } else {
            fs.readFile(`data/${queryData.id}`,'utf8', function(err, description){
                var title = queryData.id;
                var template = `
                <!doctype html>
                <html>
                <head>
                <title>WEB1 - ${title}</title>
                <meta charset="utf-8">
                </head>
                <body>
                <h1><a href="/">PUBG Statistic</a></h1>
                <ul>
                  <li><a href="/?id=all">전체</a></li>
                </ul>
                <h2><a>순위</a></h2>
                <ol>
                  <img src="/img" width="40%"/>
                  <li><a href="/?id=person1">사람1</a></li>
                  <li><a href="/?id=person2">사람2</a></li>
                  <li><a href="/?id=person3">사람3</a></li>
                  <li><a href="/?id=person4">사람4</a></li>
                </ol>
                <h2>${title}</h2>
                <p>
                </p>
                </body>
                </html>
                
                `;
                response.writeHead(200);
                response.end(template);
            } );
        }
        
    }else if(_url ==='/img'){
      fs.readFile('./img/pubg.png', function(err, data){
          console.log('picture loading...');
          response.writeHead(200);
          response.write(data);
          response.end();
      });


    }else{
        response.writeHead(404);
        response.end('Not found');
    }

    
    
    

});
app.listen(2000);