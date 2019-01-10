module.exports = class WebSocketClient {
    
    constructor(identifier) {
        this.identifier = identifier;
        this.events = [];
    }

    connect(address, port)
    {
        this.isBrowser = (typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined');
        this.ws = this.isBrowser == true ? new window.WebSocket(address) : new (require('ws'))(address);

        if (this.isBrowser == true)
        {
            this.ws.onmessage = (event) => {
                let data = event.data;
                for (let i = 0; i < this.events.length; i++)
                {
                    let e = this.events[i];
                    if (e.event == 'message' && e.callback) e.callback(data);
                }
            }

            this.ws.onclose = (event) => {
                let data = event.data;
                for (let i = 0; i < this.events.length; i++)
                {
                    let e = this.events[i];
                    if (e.event == 'close' && e.callback) e.callback();
                }
            }

            this.ws.onopen = (event) => {
                for (let i = 0; i < this.events.length; i++)
                {
                    let e = this.events[i];
                    if (e.event == 'open' && e.callback) e.callback();
                }
            }
        }

        this.on('open', () => {
            if (this.identifier)
                this.ws.send(JSON.stringify({type:'internalhandshake', data:{identifier:this.identifier}}))
        });
    }
    
    on (event, callback) {

        this.events.push({event:event, callback:callback});
        if (this.isBrowser == false)
        {
            this.ws.on(event, (...args) => callback(...args));
        }
    }
    
    send(obj)
    {
        if (typeof obj !== 'string') obj = JSON.stringify(obj);
        this.ws.send(obj);
    }

    joinRoom(name, password)
    {
        this.ws.send(JSON.stringify({joinroom:name, password:password}));
    }
}


/*
var WebSocketClientClass = require('websocket').client;
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