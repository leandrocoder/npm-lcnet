//var WebSocketClientClass = require('websocket').client;


const WebSocketClass = require('ws');



module.exports = class WebSocketClient {

    constructor(host, port) {
        this.ws = new WebSocketClass('ws://' + host + ":" + port);
    }

    on (event, callback) {
        this.ws.on(event, (...args) => callback(...args));
    }

    send(data)
    {
        this.ws.send(data);
    }
}


/*
module.exports = class WebSocketClient {

    constructor() {
        this.events = [];
        this.client = new WebSocketClientClass();
    }

    tryConnect(ip, port) {
        if (this.connected == false)
            this.client.connect(`ws://${ip}:${port}/`);
    }

    keepConnection(ip, port) {
        this.tryConnect(ip, port);
        setInterval(function() {
            this.tryConnect(ip, port);
        }.bind(this), 2000);
    }

    init(ip, port) {
        this.client.on('connect', function(connection) {

            console.log("connected!");
            this.connected = true;
            this.connection = connection;
            
            connection.on('close', function() { 
                console.log("disconnected :(");
                this.connected = false;
            }.bind(this));

            for (let i = 0; i < this.events.length; i++)
            {
                let e = this.events[i];
                connection.on(e.event, function(message) {
                    let data = message.utf8Data;
                    try {
                    data = JSON.parse(data);
                    } catch (err) {}
                    if (e.callback != null) e.callback(data);
                }.bind(this));
            }

        }.bind(this));

        this.keepConnection(ip, port);
        
    }

    on(event, callback) {
        this.events.push({event:event, callback:callback});
    }

    send(obj) {
        if (this.connection) this.connection.send(JSON.stringify(obj));
    }
}
*/