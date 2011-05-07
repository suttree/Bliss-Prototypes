var sys = require("sys"),
    fs = require("fs"),
    path = require("path"),
    http = require("http"),
    ws = require(__dirname + '/lib/ws');

function log(msg) {
  sys.puts(msg.toString());
};

Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
}

Array.prototype.remove = function (subject) {
  var r = new Array();
  for(var i = 0, n = this.length; i < n; i++)
  {
    if(!(this[i] === subject))
    {
      r[r.length] = this[i];
    }
  }
  return r;
}

function gameStatus(players) {
  return JSON.stringify({
    players: players.length.toString(),
    status: 'Ready',
  });
}

var server = ws.createServer({
  debug: true
});

var players = [];

server.addListener("listening", function(){
  log("Listening for connections.");
});

// Handle WebSocket Requests
server.addListener("connection", function(conn){
  log("opened connection: "+conn.id);
  
  if (!players.contains(conn.id)) {
    players.push(conn.id);
    log(players);
  }
  
  log(gameStatus(players));
  server.send(conn.id, gameStatus(players));
  conn.broadcast(gameStatus(players));
  
  conn.addListener("message", function(message){
    log("<"+conn.id+"> "+message);
    conn.broadcast("<"+conn.id+"> "+message);
  });
});

server.addListener("close", function(conn){
  log("closed connection: "+conn.id);

  if (players.contains(conn.id)) {
    players = players.remove(conn.id);
    log(players);
  }

  conn.broadcast(gameStatus(players));
});

server.listen(1975, "173.45.236.98");
