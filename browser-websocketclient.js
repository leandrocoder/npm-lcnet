const eventify = require('./eventify.js');

class BrowserWebsocketClient
{
    constructor(address, identifier)
    {
        eventify(this);

        this.identifier = identifier;
        this.address = address;
        this.ws = null;
        this.connect();
    }

    connect()
    {
        this.ws = new window.WebSocket(this.address);

        let addEventBridge = (event, internalCallback) =>
        {
            this.ws["on" + event] = (e) => { 
                let data = e && e.data ? e.data : null;
                if (internalCallback) internalCallback(data);
                this.emit(event, data);
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

module.exports = BrowserWebsocketClient;