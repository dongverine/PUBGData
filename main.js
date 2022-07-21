var http = require('http');
var fs = require('fs');
var url = require('url');


var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    
   

    if(pathname === '/'){
        if(queryData.id === undefined){
            
            fs.readFile(`data/${queryData.id}`,'utf8', function(err, description){
                var title = 'For The Squard';
                var description = 'Hello, Node.js';
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
                  <img src="/img" width="40%">
                  <li><a href="/?id=person1">사람1</a></li>
                  <li><a href="/?id=person2">사람2</a></li>
                  <li><a href="/?id=person3">사람3</a></li>
                  <li><a href="/?id=person4">사람4</a></li>
                </ol>
                <h2>${title}</h2>
                <p>
                  <img src="/img" width="40%"/>
                </p>
                </body>
                </html>
                
                `;
                response.writeHead(200);    
                response.end(template);
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
        
    }else{
        response.writeHead(404);
        response.end('Not found');
    }

    
    
    

});
app.listen(3000);