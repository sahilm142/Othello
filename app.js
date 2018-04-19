var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname+"/client"));

// app.get('/',function(req, res){
//     res.sendFile("index.html", {root: __dirname+"/client" });
// });

var games=[];
var tokens=[];

// On connection
io.on('connection', function(socket){
    console.log('A user connected');
    var curToken=null;
    socket.on('keyPressed',function(data){
        io.sockets.in(curToken).emit("keyPressed",data);
     });
    socket.on('newGame',function(data){
 //       console.log(data);
        if(tokens.indexOf(data.token)>-1){
            socket.emit('tokenExists',{token:data.token});
        }
        else{
            tokens.push(data.token);
            var token={
                        name:data.token,
                        members:['Black']
                        }
            games.push(token);
            socket.emit('gameCreated',{token:token});
            socket.join(data.token);
            curToken=token.name;
        }
    });

    socket.on('joinGame',function(data){
        console.log(data);
        var index = tokens.indexOf(data.token);
        console.log(index);
        if(index==-1){
            socket.emit("invalidToken");
            return;
        }
        if(games[index].members.length==2){
            socket.emit('fullGame');
            return;
        }
        games[index].members.push('White');
        curToken=data.token;
        socket.emit('gameJoined',{opponent:'Black',token:curToken});
        io.sockets.in(curToken).emit('joined',{opponent:'White'})
        socket.join(data.token);
       
    });

    socket.on('disconnect', function(){
        console.log('User disconnected');
    });
});

http.listen(3004, function(){
    console.log("Connected at 3004 port");
});