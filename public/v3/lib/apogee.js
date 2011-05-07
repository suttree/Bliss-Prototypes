var conn;
var output_log = document.getElementById("log");
var connect = function() {
  if (window["WebSocket"]) {
    conn = new WebSocket("ws://localhost:1975/test");
    conn.onmessage = function(evt) {
      log(evt.data);
    };
    
    conn.onclose = function() {
      log("closed");
    };

    conn.onopen = function() {
      log("opened");
    };
  }
};
