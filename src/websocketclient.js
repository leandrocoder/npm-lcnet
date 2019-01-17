const EventEmitter = require('events');

module.exports = class WebSocketClient extends EventEmitter {
    
    constructor(address, identifier) {

        super();

        this.identifier = identifier;
        this.address = address;
        this.ws = null;
        this.connect();
    }


    connect()
    {
        this.isBrowser = (typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined');
        this.ws = this.isBrowser == true ? new window.WebSocket(this.address) : new (require('ws'))(this.address);

        let addEventBridge = (event) =>
        {
            if (this.isBrowser == true) {
                this.ws["on" + event] = (e) => { this.emit(event, e.data); }
            } else {
                this.ws.on(event, (...args) => { this.emit(event, ...args); });
            }
        }

        let addEventListener = (event, callback) => {
            if (!callback) return;

            if (this.isBrowser == true) {
                this.ws["on" + event] = (e) => { callback(e.data); }
            } else {
                this.ws.on(event, (...args) => { callback(...args); });
            }
        }

        addEventBridge("open");
        addEventBridge("close");
        addEventBridge("error");
        addEventBridge("message");

        addEventListener("open", () => {
            if (this.identifier)
                this.ws.send(JSON.stringify({type:'internalhandshake', data:{identifier:this.identifier}}))
        })
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
module.exports = class WebSocketClient {
    
    constructor(address, identifier) {
        this.identifier = identifier;
        this.events = [];
        this.address = address;
        this.connectTimeout = null;
        this.connect();
    }

    connect()
    {

        this.isBrowser = (typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined');
        this.ws = this.isBrowser == true ? new window.WebSocket(this.address) : new (require('ws'))(this.address);

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

            this.ws.onerror = (event) => {
                let data = event.data;
                for (let i = 0; i < this.events.length; i++)
                {
                    let e = this.events[i];
                    if (e.event == 'error' && e.callback) e.callback();
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


        this.on('error', () => {
            this.__reconnect();
        });

        this.on('close', () => {
            this.__reconnect();
        });
    }

    __reconnect()
    {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = setTimeout(() => {
            this.connect();
        }, 1000);
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
*/