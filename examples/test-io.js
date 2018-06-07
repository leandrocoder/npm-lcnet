const IO = require("../main").SocketIO;

let socketIO = new IO();

socketIO.connect("192.168.10.150", 8000);
socketIO.addListener("message", function(data) {
    console.log("1 >", data);
}.bind(this));
