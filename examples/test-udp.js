const { UDP } = require("../main");

const SEND_PORT = 9100;
const RECEIVE_PORT = 4000;

let broadcastIP = UDP.getBroadcastIP();

UDP.addListener(RECEIVE_PORT, function(data, remote) {
    console.log(`${remote.address}:${remote.port} says >`, data);
}.bind(this));

/*
setInterval(function() {
    UDP.send("ping", broadcastIP, SEND_PORT);
}, 1000);
//*/