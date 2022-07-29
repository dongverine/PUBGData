var http = require('http');
var fs = require('fs');
var url = require('url');
const express = require('express');
const PropertiesReader = require('properties-reader');
const PubgRankAPI = require('./custom_modules/PubgRankAPI.js')


var app = http.createServer(async function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    //app.use(express.static('./img'));

   
    
    if(pathname === '/'){
        const properties = PropertiesReader('setting.properties');
        const apiKey = properties.get("api.key");        
        let pubgAPI = new PubgRankAPI(apiKey);
        let sortedRankUserList = [];
        let responseJson = {};
        try { 
            responseJson = await pubgAPI.getPlayerRankList("dators,bleumer102,77cloud,gasip");
        }catch(error){
            console.log(error);
            let errorMessage = "["+error.errorCode+"] " + error.errorMessage;
            response.writeHead(error.errorCode);    
            response.end(errorMessage);
            return;
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
                name: 'username',
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
    }
});
app.listen(2000);