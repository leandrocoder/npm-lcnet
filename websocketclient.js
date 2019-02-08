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

        let addEventBridge = (event, internalCallback) =>
        {
            if (this.isBrowser == true) {
                this.ws["on" + event] = (e) => { 
                    let data = e && e.data ? e.data : null;
                    if (internalCallback) internalCallback(data);
                    this.emit(event, data);
                }
            } else {
                this.ws.on(event, (...args) => { 
                    this.emit(event, ...args); 
                    if (internalCallback) internalCallback(...args);
                    this.emit(event, ...args);
                });
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

        addEventBridge("open", () => {
            this.emit("open");
            if (this.identifier)
                this.ws.send(JSON.stringify({type:'internalhandshake', data:{identifier:this.identifier}}))
        });
        
        addEventBridge("close");
        addEventBridge("error");
        addEventBridge("message");
    }
    
    send(obj)
    {
        if (!this.ws || this.ws.readyState != 1) return;
        if (typeof obj !== 'string') obj = JSON.stringify(obj);
        this.ws.send(obj);
    }

    joinRoom(name, password)
    {
        this.ws.send(JSON.stringify({joinroom:name, password:password}));
    }
}

