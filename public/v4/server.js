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

function handleEvent(id, type, message, players) {
  if (type == 'location') {
    return handleLocation(id, message, players);
  } else if (type == 'connection') {
    return handleConnection(id, message, players);
  } else if (type == 'disconnection') {
    return handleDisconnection(id, message, players);
  } else {
    return JSON.stringify({
      error: "Don't know how to handle 'type'" + type,
    });
  }
}

function handleConnection(id, message, players) {
  players[id] = {}
  return current_status(id, 'connection', players);
}

function handleDisconnection(id, message, players) {
  delete players[id];
  return current_status(id, 'disconnection', players);
}

function handleLocation(id, message, players) {
  players[id] = {
    lat: message.lat,
    lon: message.lon,
    score: 100,
  }

  return current_status(id, 'location', players);
}

function current_status(id, type, players) {
  var message = {
    id: id,
    type: type,
    players: players
  };

  return JSON.stringify(message);
}

var server = ws.createServer({
  debug: true
});

var players = {};

server.addListener("listening", function(){
  log("Listening for connections.");
});

/*
  How it works...
  on connections - add player to players[], and send back JSON for all players so that new player can get a map setup
  on disconnection - remove player from players[], and send back JSON to all players so that they can update their map
  on location - send conn.id + lat/lon to all players so that they can update their maps 
    (on client side, update map with lat/lon based on your location and the new player location)
*/
// Handle WebSocket Requests
server.addListener("connection", function(conn){
  log("opened connection: "+conn.id);

  var response = handleEvent(conn.id, 'connection', false, players);
  server.send(conn.id, response);

  conn.addListener("message", function(evt){
    log("<"+conn.id+"> "+evt);

    var message = JSON.parse(evt);
    var response = handleEvent(conn.id, message['event_type'], message, players);
    conn.broadcast(response);
  });
});

server.addListener("close", function(conn){
  log("closed connection: "+conn.id);

  var response = handleEvent(conn.id, 'disconnection', false, players);
  conn.broadcast(response);
});

server.listen(1975, "173.45.236.98");
