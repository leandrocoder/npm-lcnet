const UDP = require('../udp');
const STDIN = require('../src/stdin');

let udp = new UDP();
let sendPort = 3000;
let receivePort = 3001;
let localhost = '127.0.0.1';
STDIN.on("*", (data) => {
    udp.send(data, localhost, sendPort);
})

console.log(`Type something to send using port (${sendPort}) and receive by ${receivePort} :`);

//{"type":"server","requestconnection":"Takeaway", "port":3001}