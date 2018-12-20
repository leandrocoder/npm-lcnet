const UDP = require('../udp');
const STDIN = require('../src/stdin');

let udp = new UDP();
let localhost = udp.getLocalIP();
let port = 3000;

udp.addListener(port, (data) => {
    console.log("<", data);
})

STDIN.on("*", (data) => {
    udp.send(data, localhost, port);
})

console.log(`Type something to receive using the same port (${port}) :`);