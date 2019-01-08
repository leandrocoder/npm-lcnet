const util = require('./src/utils');
const NetManager = require('./src/netmanager');

let ip = util.getLocalIP();

console.log(ip);

let config = {
    "server":[
        {
            "name":"MMServer",
            "type":"websocket", 
            "port":5000, 
            "forwardmessages":true,
            "rooms":[
                {"name":"mmroom"}
            ]
        }
    ]
}

let app = new NetManager(config);

