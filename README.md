# lcnet
Network handler for Javascript and NodeJS
 **Install**
```
npm i --save lcnet
```
  
**How to use**
 - With SocketIO
   
 ```js
const LCSocketIO = require("lcnet").SocketIO;
 const  HOST_IP  =  "127.0.0.1";
const  PORT  =  8000;
 let io = new LCSocketIO();
 // start the connection and start listening to some events
io.connect(HOST_IP, PORT);
io.addListener("connect", () =>  console.log("conncted!"));
io.addListener("disconnect", () =>  console.log("disconnected!"));
io.addListener("message", (data) => {
	console.log("receive >", data);
}
 // send an object with the specific type
io.send("message", {type:"json object"});
 // disconnect from socket
io.close();
```
 - With UDP
```js
const {UDP} = require("lcnet");
 const  RECEIVE_PORT  =  3000;
const  SEND_PORT  =  3001;
 let  broadcastIP  =  UDP.getBroadcastIP();
 UDP.addListener(RECEIVE_PORT, function(data, remote) {
	console.log(`${remote.address}:${remote.port} says >`, data);
});
 UDP.send("string message", broadcastIP, SEND_PORT);
```